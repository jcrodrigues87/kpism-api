const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const Period = require('../../models/Period');
const Basket = require('../../models/Basket');

const moment = require('moment');

// query basket for an indicator
router.get('/:indicatorRefId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId);

    if (indicatorRef) {
      const basket = await Basket.findOne({indicatorRef: indicatorRef}).populate('basketItems.indicator')
      return res.json({ basket: basket.toCrudJSON() });
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// update basket list
router.put('/:indicatorRefId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId).populate(['period']);
    var basket = await Basket.findOne({indicatorRef: indicatorRef}).populate('basketItems.indicator')
    const period = await Period.findOne({_id: indicatorRef.period._id});
    if (indicatorRef && basket) {
      if (period.closed === false) {
        basket.basketItems = req.body.basketItems;
        await basket.save();

        basket = await Basket.findOne({indicatorRef: indicatorRef}).populate('basketItems.indicator')
        return res.json({ basket: basket.toCrudJSON() });
      } else
        return res.sendStatus(403);
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// Delete a basket item 
router.delete('/:indicatorRefId/:indicatorId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId).populate(['period']);
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findOne({_id: indicatorRef.period._id});
    const basket = await Basket.findOne({indicatorRef: indicatorRef});
    if (indicatorRef && indicator && basket) {
      if (period.closed === false) {
        for (i = 0; i < basket.basketItems.length; i++) {
          if (basket.basketItems[i].indicator.toString() == indicator._id.toString()) {
            const removed = basket.basketItems.splice(i, 1);
            basket.save();
            return res.sendStatus(204);
          }
        }
          return res.sendStatus(204);
      } else
        return res.sendStatus(403);
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;