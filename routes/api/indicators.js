const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const User = require('../../models/User');
const Period = require('../../models/Period');
const Department = require('../../models/Department');
const BasketItem = require('../../models/BasketItem');

const moment = require('moment');

responsablePopulateUser = async user => {
  if (user.department)
    user.department = await Department.findById(user.department).populate(['manager','childOf']);
  
  return user;
}

///////////////////////////////////////////////////
//
// INDICATOR
//
///////////////////////////////////////////////////

// create a new indicator, access by supervisor
router.post('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);
    const indicator = new Indicator(req.body.indicator);
    if (period) {
      if (period.closed === false) {
        
        indicator.period = period;
        if (req.body.indicator.department && req.body.indicator.department.id) 
          indicator.department = await Department.findById(req.body.indicator.department.id).populate(['manager']);
        else 
          indicator.department = undefined;

        // create metering
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        for (var i = 1; i <= 12; i++) {
          indicator.metering.push({refOrder: i, refName: monthNames[i-1]})
        }

        await indicator.save();

      } else // if period is locked, deny the access
        return res.sendStatus(403);
    } else
      return res.sendStatus(404);

    return res.json({ indicator: indicator.toCrudJSON() });
  } catch (err) {
    return next(err);
  }
});

// get indicator data, access by supervisor
router.get('/:periodId/:indicatorId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['department', 'period']);

    if (period && indicator)
      return res.json({ indicator: indicator.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// query indicators by period, access by supervisor
router.get('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);
    if (period) {
      const indicators = await Indicator.find({period: period._id}).populate(['department', 'period']);
      return res.json({ indicators: indicators.map(indicator => indicator.toCrudJSON()) });
    } else
      return res.sendStatus(404);

  } catch (err) {
    return next(err);
  }
});

// update indicator data, access by supervisor
router.put('/:periodId/:indicatorId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period']);

    if (period && indicator) {
      const { name, description, measure, accumulatedType, orientation, classification, department, basket, metering } = req.body.indicator;

      if (period.closed === false) {

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
        if (classification !== undefined)
          indicator.classification = classification;
        if (department !== undefined)
          if (department && department.id)
            indicator.department = await Department.findById(department.id).populate(['manager','childOf']);
          else
            indicator.department = undefined;
        if (basket !== undefined)
          indicator.basket = basket;
        await indicator.save();

      } else
        return res.sendStatus(403)

      return res.json({ indicator: indicator.toCrudJSON() });
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// TESTAR INTEGRIDADE *****************************************************************
// delete indicator data, access by Admin
router.delete('/:periodId/:indicatorId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId)
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (period && indicator) {
      if (period.closed === false) {

        const indicator = await Indicator.findByIdAndRemove(req.params.indicatorId);
        const contractIndicator = await ContractIndicator.deleteMany({indicator: indicator._id}); // if indicator is deleted, indicator inside contracts must be deleted too
        const basketItemRef = await BasketItem.deleteMany({indicatorRef: indicator._id}); // if indicator is deleted, the basket that it is root must be deleted too
        const basketItem = await BasketItem.deleteMany({indicator: indicator._id}); // if indicator is deleted, the basket that it is leaf must be deleted too
      
      } else 
        return res.sendStatus(403);
    } else
      return res.sendStatus(404)

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

///////////////////////////////////////////////////
//
// INDICATOR METERINGS ENDPOINTS
//
///////////////////////////////////////////////////

// update target and actual meteretings for an indicator
router.put('/meterings/:periodId/:indicatorId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period']);

    if (period && indicator) {
      if (period.closed === false) {
        const meterings = req.body.meterings; // receive all meterings (jan to dez)
        for (i = 0; i < 12; i++) {
          if (meterings.length !== 12) // if actual or target is undefined, return bad request
            return res.sendStatus(400)
          const { target, actual } = meterings[i];
          if (indicator.orientation === 'higher') {
            difference = actual - target;
            percent =  target ? (actual / target) * 100 : 0;
          }
          if (indicator.orientation === 'lower') {
            difference = target - actual;
            percent = actual ? (target / actual) * 100 : 0;
          }
          indicator.metering[i].actual = actual;
          indicator.metering[i].target = target;
          indicator.metering[i].difference = difference;
          indicator.metering[i].percent = percent;
        }
        await indicator.save();
        return res.json({ indicator: indicator.toCrudJSON() });
      } else
        return res.sendStatus(403)
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

///////////////////////////////////////////////////
//
// INDICATOR BASKETITEM ENDPOINTS
//
///////////////////////////////////////////////////

// query basketItens for an indicator and period
router.get('/:indicatorId/basketItems', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (indicator) {

      const basketItems = await BasketItem.find({ 
        indicatorRef: indicator
      }).populate([
        { 
          path: 'indicator', 
          populate: { path: 'department' } 
        }
      ]).sort({ weight: -1 });

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

module.exports = router;