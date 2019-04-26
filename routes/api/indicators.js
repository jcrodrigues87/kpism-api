const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const User = require('../../models/User');
const Period = require('../../models/Period');
const Responsable = require('../../models/Responsable');
const Department = require('../../models/Department');
const Metering = require('../../models/Metering');
const BasketItem = require('../../models/BasketItem');

const moment = require('moment');

responsablePopulateUser = async user => {
  if (user.department)
    user.department = await Department.findById(user.department).populate(['manager','childOf']);
  
  return user;
}

// create a new indicator, access by supervisor
router.post('/', async (req, res, next) => {
  try {
    const indicator = new Indicator(req.body.indicator);

    if (req.body.indicator.department && req.body.indicator.department.id) 
      indicator.department = await Department.findById(req.body.indicator.department.id).populate(['manager']);
    else 
      indicator.department = undefined;

    await indicator.save();

    return res.json({ indicator: indicator.toCrudJSON() });
  } catch (err) {
    return next(err);
  }
});

// update indicator data, access by supervisor
router.put('/:indicatorId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (indicator) {
      const { name, description, measure, accumulatedType, orientation, department, basket } = req.body.indicator;

      if (name !== undefined)
        indicator.name = name;

      if (description !== undefined)
        indicator.description = description;

      if (measure !== undefined)
        indicator.measure = measure;

      if (accumulatedType !== undefined)
        indicator.accumulatedType = accumulatedType;

      if (orientation !== undefined)
        indicator.orientation = orientation;

      if (department !== undefined)
        if (department && department.id)
          indicator.department = await Department.findById(department.id).populate(['manager','childOf']);
        else
          indicator.department = undefined;

      if (basket !== undefined)
        indicator.basket = basket;

      await indicator.save();

      return res.json({ indicator: indicator.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get indicator data, access by supervisor
router.get('/:indicatorId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['department']);

    if (indicator)
      return res.json({ indicator: indicator.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// delete indicator data, access by supervisor
router.delete('/:indicatorId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findByIdAndRemove(req.params.indicatorId);

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

// query indicators, access by supervisor
router.get('/', async (req, res, next) => {
  try {
    if (req.query.type !== undefined) {

      if (req.query.type === 'byResponsable') {

        const responsables = await Responsable.find({
          user: req.query.userId,
          period: req.query.periodId
        }).populate(['indicator']).sort('indicator').select('indicator -_id');

        return res.json({ indicators: responsables.map(resonsable => resonsable.indicator.toCrudJSON()) });
      }

      if (req.query.type === 'byDepartment') {
        console.log(req.query.departmentId);

        const indicators = await Indicator.find({
          department: req.query.departmentId
        }).populate(['department']);

        return res.json({ indicators: indicators.map(indicator => indicator.toCrudJSON()) });
      }
      
    } else {
      const indicators = await Indicator.find().populate(['department']);

      return res.json({ indicators: indicators.map(indicator => indicator.toCrudJSON()) });
    }
  } catch (err) {
    return next(err);
  }
});

//------------------ Indicators BasketItem endpoints ------------------//
// query basketItens for an indicator and period
router.get('/:indicatorId/basketItems', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (indicator) {

      const basketItems = await BasketItem.find({ 
        indicatorRef: indicator
      }).populate([
        // { 
        //   path: 'indicatorRef', 
        //   populate: { path: 'department' } 
        // },
        { 
          path: 'indicator', 
          populate: { path: 'department' } 
        }
      ]).sort({ weight: -1 });
      //}).populate(['indicatorRef','indicator']);

      return res.json({ basketItems: basketItems.map(basketItem => basketItem.toCrudJSON()) });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// add update a basketItem
router.post('/:indicatorRefId/basketItems/:indicatorId/:weight', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['department']);

    if (indicatorRef && indicator) {

      let basketItem = await BasketItem.findOne({
        indicatorRef: indicatorRef,
        indicator: indicator
      }).populate([
        { 
          path: 'indicator', 
          populate: { path: 'department' } 
        }
      ]);
      
      if (!basketItem) {
        basketItem = new BasketItem();

        basketItem.indicatorRef = indicatorRef;
        basketItem.indicator = indicator;
      }

      basketItem.weight = req.params.weight;

      await basketItem.save()

      return res.json({ basketItem: basketItem.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

router.delete('/:indicatorRefId/basketItems/:indicatorId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId);
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (indicatorRef && indicator) {

      const basketItem = await BasketItem.findOne({
        indicatorRef: indicatorRef,
        indicator: indicator
      });

      if (basketItem) {
        basketItem.delete()
        return res.sendStatus(204);
      }

    }

    return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

//------------------ Indicators Responsables endpoints ------------------//
// query responsables for an indicator and period
router.get('/:indicatorId/responsables/:periodId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findById(req.params.periodId);

    if (indicator && period) {

      const responsables = await Responsable.find({ 
        indicator: indicator, 
        period: period
      }).populate(['user','indicator','period']);

      for (let i = 0; i < responsables.length; i++) {
        responsables[i].user = await responsablePopulateUser(responsables[i].user);
      }

      return res.json({ responsables: responsables.map(responsable => responsable.toCrudJSON()) });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// add a responsable for an indicator and period
router.post('/:indicatorId/responsables/:periodId/:userId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findById(req.params.periodId);
    const user = await User.findById(req.params.userId);

    if (indicator && period && user) {

      const responsable = await Responsable.findOne({ 
        indicator: indicator, 
        period: period, 
        user: user 
      }).populate(['user','indicator','period']);

      if (responsable) {
        responsable.user = await responsablePopulateUser(responsable.user);
        return res.json({ responsable: responsable.toCrudJSON() });
      }

      const newresp = new Responsable();

      newresp.indicator = indicator;
      newresp.period = period;
      newresp.user = user;

      await newresp.save();

      newresp.user = await responsablePopulateUser(newresp.user);

      return res.json({ responsable: newresp.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// remove a responsable for an indicator and period
router.delete('/:indicatorId/responsables/:periodId/:userId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findById(req.params.periodId);
    const user = await User.findById(req.params.userId);

    if (indicator && period && user) {

      const responsable = await Responsable.findOne({ 
        indicator: indicator, 
        period: period, 
        user: user 
      }).populate(['user','indicator','period']);

      if (responsable)
        await responsable.delete()

      return res.sendStatus(204);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

//------------------ Indicators Meterings endpoints ------------------//
// update meterings accoring to period and return updated values
updatedMeterings = async (indicator, period, meterings) => {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                      "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  let begin = new Date(period.begin + ' 00:00:00'), 
      end = new Date(period.end + ' 00:00:00'),
      metering,
      meteringsRef = [];

  while (begin <= end) {
    metering = new Metering();

    metering.period = period;
    metering.indicator = indicator;
    metering.refOrder = begin.getMonth() + 1;
    metering.refName = monthNames[begin.getMonth()] + '/' + begin.getFullYear();
    metering.target = 0;
    metering.actual = 0;
    metering.difference = 0;
    metering.percent = 0;

    meteringsRef.push(metering);

    begin.setMonth(begin.getMonth() + 1);
  }

  // if there's no previous meterings for indicator and period
  if (meterings.length === 0) {
    await Promise.all(meteringsRef.map(async metering => {
      await metering.save();
    }));

    return meteringsRef;
  }

  // if there's previous meterings for indicator and period
  let diff;

  // add new meterings to existing colletction
  meteringsRef.map(mr => {
    diff =[];

    diff = meterings.filter(m => m.refName === mr.refName);

    if (diff.length === 0)
      meterings.push(mr);
  });

  //remove old meterings to existing colletction
  let toRemove = [];

  meterings.map((m) => {
    diff =[];

    diff = meteringsRef.filter(mr => m.refName === mr.refName);

    if (diff.length === 0)
      toRemove.push(m);
  });

  meterings = meterings.filter(m => {
    let toReturn = true;
    toRemove.forEach(tr => {
      if (tr.refName === m.refName)
        toReturn = false;
    });
    return toReturn;
  })

  // persist 
  await Promise.all(toRemove.map(async metering => {
    await metering.delete();
  }));

  await Promise.all(meterings.map(async metering => {
    metering.createdAt = period.updatedAt;
    metering.updatedAt = period.updatedAt;
    await metering.save();
  }));

  // return sorted updated list
  return meterings.sort((a, b) => {
    if (a.refOrder > b.refOrder)
      return 1;

    if (a.refOrder < b.refOrder)
      return -1;

    return 0;
  });
};

calcBasket = async (indicator, periodId, refOrder) => {

  const metering = new Metering();

  const meteretings = [];

  const basketItems = await BasketItem.find({
    indicatorRef: indicator
  }).populate('indicator');

  basketItems.forEach(item => {
    meteretings.push({});
  });

  console.log(basketItems);

  return metering;
};

// query meterings for an indicator and period
router.get('/:indicatorId/meterings/:periodId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findById(req.params.periodId);

    if (indicator && period) {
      let meterings = await Metering.find({ 
        indicator: indicator, 
        period: period
      }).populate(['indicator','period']).sort('refOrder');

      // if there's no meterings for indicator and period or the period has changed
      if (meterings.length === 0 || meterings[0].createdAt < period.updatedAt) {
        meterings = await updatedMeterings(indicator, period, meterings);
      }

      return res.json({ meterings: meterings.map(metering => metering.toCrudJSON()) });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// query meterings for an indicator and period
router.get('/:indicatorId/meterings/:periodId/:refOrder', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (!indicator)
      return res.sendStatus(404);

    // if (indicator.basket) {
    //   await calcBasket(indicator, req.params.periodId, req.params.refOrder);
    // }

    let metering = await Metering.findOne({ 
      indicator: req.params.indicatorId, 
      period: req.params.periodId,
      refOrder: req.params.refOrder
    }).populate(['indicator','period']);

    if (metering) {
      return res.json({ metering: metering.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// query meterings for an indicator and period
router.get('/:indicatorId/meterings/:periodId/:refOrder/accumulated', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (!indicator)
      return res.sendStatus(404);

    if (indicator.accumulatedType === 'equalsref') {
      const metering = await Metering.findOne({
        indicator: req.params.indicatorId, 
        period: req.params.periodId,
        refOrder: req.params.refOrder 
      }).populate(['indicator','period']).sort('refOrder');

      if (metering) {
        return res.json({ metering: metering.toCrudJSON() });
      } else
        return res.sendStatus(404);
    }

    const meterings = await Metering.find({ 
      indicator: req.params.indicatorId, 
      period: req.params.periodId,
      refOrder: { $lte: req.params.refOrder }
    }).populate(['indicator','period']);

    if (meterings.length < 1)
      return res.sendStatus(404);
    
    let toReturn = meterings[meterings.length - 1];
        tTarget = 0;
        tActual = 0;
        count = 0;

    meterings.forEach(m => {
      tTarget += m.target;
      tActual += m.actual;
      count++;
    });
    
    if (indicator.accumulatedType === 'sum') {
      toReturn.target = tTarget;
      toReturn.actual = tActual;
    } 

    if (indicator.accumulatedType === 'avg') {
      toReturn.target = tTarget / count;
      toReturn.actual = tActual / count;
    } 

    if (indicator.orientation === 'higher') {
      toReturn.difference = toReturn.actual - toReturn.target;
      toReturn.percent =  toReturn.target ? (toReturn.actual / toReturn.target) * 100 : 0;
    } 

    if (indicator.orientation === 'lower') {
      toReturn.difference = toReturn.target - toReturn.actual;
      toReturn.percent =  toReturn.actual ? (toReturn.target / toReturn.actual) * 100 : 0;
    }

    return res.json({ metering: toReturn.toCrudJSON() });
    
  } catch (err) {
    return next(err);
  }
});


// update tanget and actual meteretings for an indicator
router.put('/:indicatorId/meterings', async (req, res, next) => {
  try {
    const meterings = req.body.meterings;

    const indicator = await Indicator.findById(req.params.indicatorId);

    if (indicator) {
      let toReturn = [];

      await Promise.all(meterings.map(async meter => {
        const { id, target, actual } = meter;

        let difference, percent;

        if (indicator.orientation === 'higher') {
          difference = actual - target;
          percent =  target ? (actual / target) * 100 : 0;
        } 
    
        if (indicator.orientation === 'lower') {
          difference = target - actual;
          percent =  actual ? (target / actual) * 100 : 0;
        }

        metering = await Metering.findByIdAndUpdate(id, { target, actual, difference, percent }, { new: true }).populate(['period','indicator']);

        toReturn.push(metering);
      }));
      return res.json({ 
        meterings: toReturn.sort((a, b) => {
          if (a.refOrder > b.refOrder)
            return 1;

          if (a.refOrder < b.refOrder)
            return -1;

          return 0;
        }).map(m => m.toCrudJSON()) });
    } else {
     return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;