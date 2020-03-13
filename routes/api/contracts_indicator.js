const router = require('express').Router();
const Contract = require('../../models/Contract');
const Indicator = require('../../models/Indicator');
const Contract_Indicator = require('../../models/ContractIndicator');
const User = require('../../models/User');
const Period = require('../../models/Period');

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

// get contract data by user/period
router.get('/:userId/:periodId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const period = await Period.findById(req.params.periodId);

    if (user && period) { // if there are user and period, find contract
      let contract = await Contract.findOne({user: user._id, period: period._id}).populate(['user', 'period']); 
      if (!contract) { // if contract doesn't exist, create one
        if (period.closed == false) {
          contract = new Contract({user: user, period: period}).populate(['user', 'period']);
          await contract.save();
        } else
          return res.sendStatus(403)
      }
      return res.json({ contract: contract.toCrudJSON() });
    }

    return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// update contract data
router.put('/:userId/:periodId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const period = await Period.findById(req.params.periodId);

    if (user && period) { // if user and period is valid
      if (period.closed == false) {
        const contract = await Contract.findOne({user: user._id, period: period._id}).populate(['user', 'period'])
        if (contract) { // if contract exists
          const { salary, proportionalPeriod, bonus, qualitative, quantitative, resultContract, plr, tax, finalPlr } = req.body.contract;
          if (salary !== undefined)
            contract.salary = salary;
          if (proportionalPeriod !== undefined)
            contract.proportionalPeriod = proportionalPeriod;
          if (bonus !== undefined)
            contract.bonus = bonus;
          if (qualitative !== undefined)
            contract.qualitative = qualitative;
          if (quantitative !== undefined)
            contract.quantitative = quantitative;
          if (resultContract !== undefined)
            contract.resultContract = resultContract;
          if (plr !== undefined)
            contract.plr = plr;
          if (tax !== undefined)
            contract.tax = tax;
          if (finalPlr !== undefined)
            contract.finalPlr = finalPlr;
          await contract.save();
          return res.json({ contract: contract.toCrudJSON() });
        }
      } else
        return res.sendStatus(403);
    }

    return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// delete contract data
router.delete('/:userId/:periodId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const period = await Period.findById(req.params.periodId);

    if (user && period) {
      if (period.closed == false)
        await Contract.findOneAndDelete({user: user._id, period: period._id});
      else
        return res.sendStatus(403)
    } else
      return res.sendStatus(404);

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;