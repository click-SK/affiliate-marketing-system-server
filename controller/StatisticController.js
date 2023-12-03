import PartnerStatisticModel from '../model/PartnerStatistic.js';
import UserModel from '../model/User.js';
import * as ParthnerStatisticService from '../services/ParthnerStatisticService.js';
import moment from 'moment-timezone';
import { CronJob } from 'cron';
const kyivTime = moment().tz('Europe/Kiev');
const formattedDate = kyivTime.format('DD.MM.YYYY');
const formattedTime = kyivTime.format('HH:mm');

// // Кожен день

const jobEveryDayStage0 = new CronJob('00 00 * * *', () => {
  ParthnerStatisticService.createDefaultEvent();
}, null, true, 'Europe/Kiev');
const jobEveryDayStage1 = new CronJob('10 00 * * *', () => {
  ParthnerStatisticService.handleBuy();
}, null, true, 'Europe/Kiev');
const jobEveryDayStage2 = new CronJob('11 00 * * *', () => {
  ParthnerStatisticService.handleCalculateNumbersStatisticsPartner();
}, null, true, 'Europe/Kiev');
const jobEveryDayStage3 = new CronJob('12 00 * * *', () => {
  ParthnerStatisticService.fillingCartMonth();
}, null, true, 'Europe/Kiev');
const jobEveryDayStage4 = new CronJob('13 00 * * *', () => {
  ParthnerStatisticService.createChartSevenDays();
}, null, true, 'Europe/Kiev');

// Раз на місяць

const jobEveryMonthStage1 = new CronJob('01 00 02 * *', () => {
  ParthnerStatisticService.clearMonthDataAllParthner();
}, null, true, 'Europe/Kiev');


const jobEveryMonthStage2 = new CronJob('02 00 02 * *', () => {
  ParthnerStatisticService.calculataLastMonthToYearChart();
}, null, true, 'Europe/Kiev');

const jobEveryMonthStage3 = new CronJob('03 00 02 * *', () => {
  ParthnerStatisticService.createDefaultChartMonth();
}, null, true, 'Europe/Kiev');

// Раз на рік

const jobEveryYearStage1 = new CronJob('18 00 00 2 1 *', () => {
  ParthnerStatisticService.calculateChartAllYears();
}, null, true, 'Europe/Kiev');

const jobEveryYearStage2 = new CronJob('19 00 00 2 1 *', () => {
  ParthnerStatisticService.createDefaultChartYear();
}, null, true, 'Europe/Kiev');


export const createPartnerStatistic = async (req, res) => {
    try {
      const {link, partnerId, promotionalСode} = req.body;
      const data = await PartnerStatisticModel.create({
        partnerId,
        link,
        promotionalСode
      })

      res.json(data)
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  } 

  // Подія переходу по посиланню
  export const handleLink = async (req, res) => {
    try {
      const { link } = req.query;

      const partner = await UserModel.findOne({ link });

      if(!partner) {
        return res.status(404).send({message:'partner not found'});
      }

      const partnerId = partner._id;
      const statistic = await PartnerStatisticModel.findOne({partnerId});

      if(!statistic) {
        return res.status(404).send({message:'statistic not found'});
      }

      const lastIndex = statistic.event.length - 1;
      const lastElementArray = statistic.event[lastIndex];
      const lastDate = lastElementArray.date;
      const isBool = lastDate == formattedDate;
      const newObject = {
        date: formattedDate,
        clicks: [`${formattedDate}/${formattedTime}`],
        buys: [],
    }

      if(isBool) {
        statistic.event[lastIndex].clicks.push(`${formattedDate}/${formattedTime}`);
      } else {
        statistic.event.push(newObject)
      }
      await statistic.save();
      res.redirect('https://makenude.ai/');

    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  // setTimeout(() => {
  //   ParthnerStatisticService.createDefaultChartYear();
  // },5000)