const router = require('express').Router();
const Contract = require('../../models/Contract');
const Indicator = require('../../models/Indicator');
const Contract_Indicator = require('../../models/ContractIndicator');
const User = require('../../models/User');
const updateActualBasket = require('../../modules/updateBasket');

// create contract_indicator, access by supervisor
router.post('/:contractId/:indicatorId/:weight', async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period']);
    if (contract && indicator) {
      if (indicator.period.closed == false) {
        const user = await User.findById(contract.user._id);
        var contract_indicator = new Contract_Indicator();
        contract_indicator.weight = req.params.weight;
        contract_indicator.contract = contract;
        contract_indicator.indicator = indicator;
        contract_indicator.user = user;
        await (await contract_indicator.save()).populate(['indicator']);
        return res.json({ contract_indicator: contract_indicator.toCrudJSON() });
      } else
        return res.sendStatus(403)
    } else
      return res.sendStatus(404)
  } catch (err) {
    return next(err);
  }
});

// query contract_indicators
router.get('/:contractId', async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (contract) {
      const contract_indicators = await Contract_Indicator.find({contract: contract}).populate(['indicator', 'contract', 'user']);
      for (var i = 0; i < contract_indicators.length; i++){
        if (contract_indicators[i].indicator.basket == true)
          contract_indicators[i].indicator = await updateActualBasket(contract_indicators[i].indicator);
      }
      return res.json({ contract_indicators: contract_indicators.map(contract_indicator => contract_indicator.toCrudJSON()) });
    } else
      return res.sendStatus(404)
  } catch (err) {
    return next(err);
  }
});

// update contract_indicator, access by supervisor
router.put('/:contractId/:indicatorId/:weight', async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period']);
    if (contract && indicator) {
      if (indicator.period.closed == false) {
        const contract_indicator = await Contract_Indicator.findOne({indicator: indicator.id, contract: contract.id}).populate(['indicator', 'contract', 'user']);
        if (req.params.weight)
          contract_indicator.weight = req.params.weight;
        await contract_indicator.save();
        return res.json({ contract_indicator: contract_indicator.toCrudJSON() });
      } else
        return res.sendStatus(403)
    } else
      return res.sendStatus(404)
  } catch (err) {
    return next(err);
  }
});

// delete contract_indicator, access by supervisor
router.delete('/:contractId/:indicatorId', async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    const indicator = await Indicator.findById(req.params.indicatorId).populate(['period']);
    if (contract && indicator) {
      if (indicator.period.closed == false) {
        const contract_indicator = await Contract_Indicator.findOneAndDelete({indicator: indicator, contract: contract});
        return res.sendStatus(204);
      } else
        return res.sendStatus(403)
    } else
      return res.sendStatus(404)
  } catch (err) {
    return next(err);
  }
});

module.exports = router;