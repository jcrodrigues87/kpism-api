const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const Period = require('../../models/Period');
const Department = require('../../models/Department');
const Basket = require('../../models/Basket');
const ContractIndicator = require('../../models/ContractIndicator')
const updateActualBasket = require('../../modules/updateBasket');

const moment = require('moment');

calcMetering = async (target, actual, orientation) => {
  if (orientation === 'higher') {
    difference = actual - target;
    percent =  target ? (actual / target) * 100 : 0;
    if (target == 0) {
      percent = actual * 100; 
    }
  }
  if (orientation === 'lower') {
    difference = target - actual;
    percent = actual ? (target / actual) * 100 : 0;
    if (actual == 0) {
      percent = target * 100;
    }
  }
  if (target == 0 && actual == 0) {
    difference = 0;
    percent = 100;
  }
  return ({difference: difference, percent: percent})
}

applyLimit = async (indicator, percent) => { // apply a upper limit in metering percent
  if (percent > indicator.limit)
    percent = indicator.limit;
  return percent;
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
          if (req.body.indicator.basket == true)
            indicator.metering.push({refOrder: i, refName: monthNames[i-1], target: 100, actual: 0, difference: -100, percent: 0})
          else
            indicator.metering.push({refOrder: i, refName: monthNames[i-1], target: 0, actual: 0, difference: 0, percent: 100})
        }

        // create basket
        if (req.body.indicator.basket == true) {
          const basket = new Basket();
          basket.indicatorRef = indicator._id
          basket.basketItems = []
          await basket.save();
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
    var indicator = await Indicator.findById(req.params.indicatorId).populate(['department', 'period']);

    if (period && indicator) {

      if (indicator.basket == true)
        indicator = await updateActualBasket(indicator);
      return res.json({ indicator: indicator.toCrudJSON() });
    } else
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
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period', 'department']);

    if (period && indicator) {
      const { name, description, equation, evaluation, measure, accumulatedType, orientation, classification, limit, department, metering } = req.body.indicator;

      if (period.closed === false) {

        if (name !== undefined)
          indicator.name = name;
        if (description !== undefined)
          indicator.description = description;
        if (equation !== undefined)
          indicator.equation = equation;
        if (evaluation !== undefined)
          indicator.evaluation = evaluation;
        if (measure !== undefined)
          indicator.measure = measure;
        if (accumulatedType !== undefined)
          indicator.accumulatedType = accumulatedType;
        if (orientation !== undefined)
          indicator.orientation = orientation;
        if (classification !== undefined)
          indicator.classification = classification;
        if (limit !== undefined)
          indicator.limit = limit;
        if (metering !== undefined)
          indicator.metering = metering;
        if (department !== undefined)
          if (department && department.id)
            indicator.department = await Department.findById(department.id).populate(['manager','childOf']);
          else
            indicator.department = undefined;
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

// delete indicator data, access by supervisor
router.delete('/:periodId/:indicatorId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId)
    const indicator = await Indicator.findById(req.params.indicatorId);

    if (period && indicator) {
      if (period.closed === false) {

        const indicator = await Indicator.findByIdAndRemove(req.params.indicatorId);
        const contractIndicator = await ContractIndicator.deleteMany({indicator: indicator._id}); // if indicator is deleted, indicator inside contracts must be deleted too
        const basketRef = await Basket.deleteMany({indicatorRef: indicator._id}); // if indicator is deleted, the basket that it is root must be deleted too
        const basket = await Basket.deleteMany({indicator: indicator._id}); // if indicator is deleted, the basket that it is leaf must be deleted too
        return res.sendStatus(204);
      } else 
        return res.sendStatus(403);
    } else
      return res.sendStatus(404)
      
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
    var indicator = await Indicator.findById(req.params.indicatorId).populate(['period', 'department']);

    if (period && indicator) {
      if (period.closed === false) {
        const meterings = req.body.meterings; // receive all meterings (jan to dez)
        if (meterings.length !== 12) // if actual or target is undefined, return bad request
          return res.sendStatus(400);

        if (indicator.basket == true) { // if indicator is basket, will be need a calc of the indicators inside of that basket
          
          for (var i = 0; i < 12; i++) {
            const { target } = meterings[i];
            indicator.metering[i].target = target;
          }
          indicator = await updateActualBasket(indicator) // do the calc of the indicator when is a basket            
          await indicator.save();
          return res.json({ indicator: indicator.toCrudJSON() });

        } else { // if isn't basket, update and calculate meterings
          for (var i = 0; i < 12; i++) {
            if (i >= period.closedMonth ) {
              const { target, actual } = meterings[i];
              const { difference, percent } = await calcMetering(target, actual, indicator.orientation);
              indicator.metering[i].actual = actual;
              indicator.metering[i].target = target;
              indicator.metering[i].difference = difference;
              indicator.metering[i].percent = await applyLimit(indicator, percent);
            }
          }
          await indicator.save();
          return res.json({ indicator: indicator.toCrudJSON() });
        }
      } else
        return res.sendStatus(403);
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;