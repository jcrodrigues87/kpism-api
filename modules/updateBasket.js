const Basket = require('../models/Basket');
const Indicator = require('../models/Indicator')

applyLimit = async (indicator, percent) => { // apply a upper limit in metering percent
    if (percent > indicator.limit)
      percent = indicator.limit;
    return percent;
  }

updateActualBasket = async (indicator) => { // calc metering of a basket 
    var basket = await Basket.findOne({indicatorRef: indicator});
    for (month = 0; month < 12; month++) { // for each month of meterings
      var actual = 0;
      for (i = 0; i < basket.basketItems.length; i++) { // for each indicator in the basket
        var indicatorMetering = await Indicator.findById(basket.basketItems[i].indicator)
        actual += (indicatorMetering.metering[month].percent * basket.basketItems[i].weight / 100)
      }  
      target = indicator.metering[month].target;
      const { difference, percent } = await calcMetering(target, actual, indicator.orientation);
      indicator.metering[month].actual = actual;
      indicator.metering[month].difference = difference;
      indicator.metering[month].percent = await applyLimit(indicator, percent); 
    }
    await indicator.save();
    return (indicator);
  }

module.exports = updateActualBasket;