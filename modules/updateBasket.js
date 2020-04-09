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
      var summation = 0;
      var weight = 0;
      indicator.metering[month].inactive = true;
      for (i = 0; i < basket.basketItems.length; i++) { // for each indicator in the basket
        var indicatorMetering = await Indicator.findById(basket.basketItems[i].indicator)
        if (!indicatorMetering) { // if indicartor doesn't exist, delete it from the basket
          basket.basketItems.splice(i, 1);
          i -= 1;
          await basket.save()
        } else {
          if (indicatorMetering.metering[month].inactive == false) {
            indicator.metering[month].inactive = false;
            summation += indicatorMetering.metering[month].percent * basket.basketItems[i].weight;
            weight += basket.basketItems[i].weight;
          }
        }
      }
      actual = weight ? (summation / weight) : 0;
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