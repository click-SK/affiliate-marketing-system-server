import AdminStatisticModel from "../model/AdminStatistic.js";
import PartnerStatisticModel from '../model/PartnerStatistic.js';
import AdminArchiheChartsMonthModel from "../model/Archive/AdminArchiheChartsMonth.js";
import AdminArchiheChartsYearModel from "../model/Archive/AdminArchiheChartsYear.js";
import UserModel from '../model/User.js';
import * as Services from './services.js';
import moment from 'moment-timezone';
const kyivTime = moment().tz('Europe/Kiev');

// Обчислюємо массив event на основі данних всіх партнерів
export const calculateEventEveryDay = async () => {
    try {
        const allStatistic = await PartnerStatisticModel.find();
        const adminStatistic = await AdminStatisticModel.findOne();
        const yesterday = moment().subtract(1, "day").format("DD.MM.YYYY");
        // const yesterday = '18.11.2023';
        let eventDate;
        let eventClicks = 0;
        let eventBuys = 0;
        let eventSumBuys = 0;

        if(!allStatistic) {
          return;
        }

        for (const oneStat of allStatistic) {
          const yesterdayEvent = oneStat.event.filter(
            (item) => item.date == yesterday
          );
          if (!yesterdayEvent.length) {
            console.log("No statistics found for user",oneStat._id);
            continue;
          }
            const lastEventItem = yesterdayEvent[0];
            eventDate = lastEventItem.date;
            eventClicks += lastEventItem.clicks.length;
            eventBuys += lastEventItem.buys.length;
            eventSumBuys += lastEventItem.buys.reduce((acc, current) => acc + current.value, 0);
        }

        adminStatistic.event.push({
            date: eventDate,
            clicksNumber: eventClicks,
            buysNumber: eventBuys,
            buysSumNumber: eventSumBuys
        })
        await adminStatistic.save();
    } catch (error) {
        console.log(error);
    }
}

// Обчислюємо числові значення на основі всх партнерів
export const calculateNumbersEveryDay = async () => {
    try {
        const allStatistic = await PartnerStatisticModel.find();
        const adminStatistic = await AdminStatisticModel.findOne();
        let clickMonth = 0;
        let buyMonth = 0;
        let buySumMonth = 0;
        let clickAllPeriod = 0;
        let buyAllPeriod = 0;
        let buySumAllPeriod = 0;
        let allConversions = 0;

        if(!allStatistic) {
          return;
        }


        for (const oneStat of allStatistic) {
            clickMonth += oneStat.clicksMonth || 0;
            buyMonth += oneStat.buysMonth || 0;
            buySumMonth += oneStat.buysSumMonth || 0;
            clickAllPeriod += oneStat.clicksAllPeriod || 0;
            buyAllPeriod += oneStat.buysAllPeriod || 0;
            buySumAllPeriod += oneStat.buysSumAllPeriod || 0;
        }
        if(clickAllPeriod && buyAllPeriod) {
          allConversions = (buyAllPeriod / clickAllPeriod) * 100;
        }
        adminStatistic.buysMonth = buyMonth;
        adminStatistic.buysSumMonth = buySumMonth;
        adminStatistic.clicksMonth = clickMonth;
        adminStatistic.clicksAllPeriod = clickAllPeriod;
        adminStatistic.buysAllPeriod = buyAllPeriod;
        adminStatistic.buysSumAllPeriod = buySumAllPeriod;
        adminStatistic.conversionAllPeriod = allConversions.toFixed(1);

        await adminStatistic.save();
    } catch(error) {
        console.log(error);
    }
}

// Очищення місячних числових значень
export const clearMonthDataAdmin = async () => {
  try {
    const adminStatistic = await AdminStatisticModel.findOne();

      if (!adminStatistic) {
        console.log("Statistic not found");
        return;
      }

      adminStatistic.buysMonth = 0;
      adminStatistic.clicksMonth = 0;
      adminStatistic.buysSumMonth = 0;
      await adminStatistic.save();
  } catch (error) {
    console.log(error);
  }
};

// Створюємо місячний графік

export const createDefaultChartMonth = async () => {
    const daysOfCurrentMonth = Services.getDaysArrayForCurrentMonth();
    const defaultArray = [];
    daysOfCurrentMonth.forEach((item) => {
      defaultArray.push({
        date: item,
        number: 0,
      })
    })
    const adminStatistic = await AdminStatisticModel.findOne();
    
      if (!adminStatistic) {
        console.log('Statistic not found');
        return
      }

      await AdminArchiheChartsMonthModel.create({
        chartsMonth: adminStatistic.chartsMonth
      })

      adminStatistic.chartsMonth.clicks = defaultArray;
      adminStatistic.chartsMonth.buys = defaultArray;
      adminStatistic.chartsMonth.conversions = defaultArray;
      await adminStatistic.save();
  }

  // Створюємо річний графік

  export const createDefaultChartYear = async () => {
    const monthCurrentYears = Services.getMonthArrayForYear();
    const defaultArray = [];

    monthCurrentYears.forEach((item) => {
      defaultArray.push({
        date: item,
        number: 0,
      })
    })

    const statistic = await AdminStatisticModel.findOne();

      if (!statistic) {
        console.log('Statistic not found');
        return
      }

      await AdminArchiheChartsYearModel.create({
        chartsYear: statistic.chartsYear
      })


      statistic.chartsYear.clicks = defaultArray;
      statistic.chartsYear.buys = defaultArray;
      statistic.chartsYear.conversions = defaultArray;

      await statistic.save();
  }

    // Створюємо графік за весь період

  export const createDefaultChartAllPeriod = async () => {
    const monthCurrentYears = Services.getAllPeriodArray();
    const defaultArray = [];

    monthCurrentYears.forEach((item) => {
      defaultArray.push({
        date: item,
        number: 0,
      })
    })

    const statistic = await AdminStatisticModel.findOne();

      if (!statistic) {
        console.log('Statistic not found');
        return
      }

      statistic.chartsYearAllPeriod.clicks = defaultArray;
      statistic.chartsYearAllPeriod.buys = defaultArray;
      statistic.chartsYearAllPeriod.conversions = defaultArray;

      await statistic.save();
  }

  // Обчислюємо місячний графік
export const calculateChartMonth = async () => {
  try {
    const allStatistic = await PartnerStatisticModel.find();
    const adminStatistic = await AdminStatisticModel.findOne();
    const yesterdayFull = moment().subtract(1, "day").format("DD.MM.YYYY");
    const yesterday = yesterdayFull.split('.')[0];

    // const yesterdayFull = '18.11.2023';
    // const yesterday = '18';

    let buysNumber = 0;
    let clicksNumber = 0;
    let conversionsNumber = 0;
    let conversionsArray = [];
    const adminChartYesterdayClickObject =
      adminStatistic.chartsMonth.clicks.filter(
        (item) => item.date == yesterday
      );
    const adminChartYesterdayBuyObject = adminStatistic.chartsMonth.buys.filter(
      (item) => item.date == yesterday
    );
    const adminChartYesterdayConversionObject =
      adminStatistic.chartsMonth.conversions.filter(
        (item) => item.date == yesterday
      );
    for (const oneStat of allStatistic) {
      const yesterdayClickEvent = oneStat.chartsMonth.clicks.filter(
        (item) => item.date == yesterday
      );
      const yesterdayBuyEvent = oneStat.chartsMonth.buys.filter(
        (item) => item.date == yesterday
      );

      const yesterdayConversionEvent = oneStat.chartsMonth.conversions.filter((item) => item.date == yesterday);
      const conversionValue = yesterdayConversionEvent[0].number;
      conversionsArray.push(conversionValue);
      buysNumber += yesterdayBuyEvent[0].number;
      clicksNumber += yesterdayClickEvent[0].number;
    }
    let average = conversionsArray.reduce((sum, value) => sum + value, 0) / conversionsArray.length;
    console.log('average',average);

    if (adminChartYesterdayClickObject) {
      adminChartYesterdayClickObject[0].number = clicksNumber;
    }
    if (adminChartYesterdayBuyObject) {
      adminChartYesterdayBuyObject[0].number = buysNumber;
    }
    if (adminChartYesterdayConversionObject) {
      adminChartYesterdayConversionObject[0].number = average.toFixed(1);
    }
    await adminStatistic.save();
  } catch (error) {
    console.log(error);
  }
};

// Обчислюємо річний графік
export const calculateChartYear = async () => {
    try {
        const allStatistic = await PartnerStatisticModel.find();
        const adminStatistic = await AdminStatisticModel.findOne();
        let buysNumber = 0;
        let buysQuantity = 0;
        let clicksNumber = 0;
        let conversionsNumber = 0;
        let month = moment().subtract(1, 'months').format("MM");

        for (const oneStat of allStatistic) {
          const buysItem =  oneStat.chartsYear.buys.filter((item) => item.date == month)

          buysNumber += buysItem[0].number;
          buysQuantity += buysItem[0].quantity;
          const clicksItem =  oneStat.chartsYear.clicks.filter((item) => item.date == month)
          clicksNumber += clicksItem[0].number;
      }

        const clicksAdminitem = adminStatistic.chartsYear.clicks.filter((item) => item.date == month);
        const buysAdminitem = adminStatistic.chartsYear.buys.filter((item) => item.date == month);
        const converionsAdminitem = adminStatistic.chartsYear.conversions.filter((item) => item.date == month);
        conversionsNumber = (buysQuantity / clicksNumber) * 100
        clicksAdminitem[0].number = clicksNumber;
        buysAdminitem[0].number = buysNumber;
        buysAdminitem[0].quantity = buysQuantity;
        converionsAdminitem[0].number = conversionsNumber.toFixed(1);

        await adminStatistic.save();
    } catch(error) {
        console.log(error);
    }
}

// Обчислюємо графік за весь період

export const calculateChartAllYears = async () => {
  try {
    const allStatistic = await PartnerStatisticModel.find();
    const adminStatistic = await AdminStatisticModel.findOne();
    let buysNumber = 0;
    let buysQuantity = 0;
    let clicksNumber = 0;
    let conversionsNumber = 0;
        // const previousYear = kyivTime.subtract(1, 'years').format("YYYY");
        const previousYear = '2023';

    for (const oneStat of allStatistic) {
      let partnerBuysItem = oneStat.chartsYearAllPeriod.buys.filter((item) => item.date == previousYear);
      let partnerClicksItem = oneStat.chartsYearAllPeriod.clicks.filter((item) => item.date == previousYear);

      buysNumber += partnerBuysItem[0].number;
      buysQuantity += partnerBuysItem[0].quantity;
      clicksNumber += partnerClicksItem[0].number;

    }

    let actualBuysItem = adminStatistic.chartsYearAllPeriod.buys.filter((item) => item.date == previousYear);
    let actualClicksItem = adminStatistic.chartsYearAllPeriod.clicks.filter((item) => item.date == previousYear);
    let actualConversionsItem = adminStatistic.chartsYearAllPeriod.conversions.filter((item) => item.date == previousYear);

    conversionsNumber = (buysQuantity / clicksNumber) * 100;

    actualBuysItem[0].number = buysNumber;
    actualBuysItem[0].quantity = buysQuantity;
    actualClicksItem[0].number = clicksNumber;
    actualConversionsItem[0].number = conversionsNumber.toFixed(1);

    await adminStatistic.save();
  } catch(error) {
    console.log('error',error);
  }
};

      // Створюємо 7 денний графік

  // export const createChartSevenDays = async () => {
  //   try {
  //     const adminStatistic = await AdminStatisticModel.findOne(); // Ця змінна не використовується у вашому коді
  //     const allStatistic = await PartnerStatisticModel.find();
  
  //     // Створюємо новий масив з семи елементів, кожен з яких має date та number
  //     let newArray = new Array(7).fill(null).map(() => ({ date: '', number: 0 }));
  
  //     // Перебираємо всі статистики
  //     for (const oneStat of allStatistic) {
  //       if (!oneStat) {
  //         console.log('User not found');
  //         continue;
  //       }

  //       console.log('oneStat.lastSevenDays.clicks',oneStat.lastSevenDays.clicks);
  
  //       // Оновлюємо дані для кожного дня
  //       oneStat.lastSevenDays.clicks.forEach((dailyStat, index) => {
  //         console.log('dailyStat',dailyStat);
  //         newArray[index].number += dailyStat.number;
  //         newArray[index].date = dailyStat.date; // Припускаючи, що дата однакова для всіх статистик і її треба встановити тільки один раз
  //       });
  //     }
  //     adminStatistic.lastSevenDaysConversions = newArray;
  //     console.log('newArray',newArray);
  //     // await adminStatistic.save();
  
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  export const createChartSevenDays = async () => {
    try {
      const adminStatistic = await AdminStatisticModel.findOne(); // Ця змінна не використовується у вашому коді
      const allStatistic = await PartnerStatisticModel.find();
  
      // Генерація масиву дат за останні 7 днів у форматі "DD" (тільки число місяця)
      let lastSevenDays = [];
      for (let i = 0; i < 7; i++) {
        let date = moment().subtract(i, 'days').format('DD');
        lastSevenDays.push(date);
      }
  
      let newArray = lastSevenDays.map(date => ({ date, number: 0 }));
  
      // Збір статистики
      for (const oneStat of allStatistic) {
        if (!oneStat) {
          console.log('User not found');
          continue;
        }
  
        oneStat.lastSevenDays.clicks.forEach((dailyStat) => {
          // Якщо dailyStat.date надходить у невизнаному форматі, його потрібно перетворити
          // Наприклад, якщо dailyStat.date є у форматі "DD", використовуйте таке перетворення
          let formattedDate = moment(dailyStat.date, "DD").format('DD');
          let index = lastSevenDays.indexOf(formattedDate);
          if (index !== -1) {
            newArray[index].number += dailyStat.number;
          }
        });
      }
  
      console.log('newArray', newArray);
      // Тут можна зберегти оновлену статистику
      adminStatistic.lastSevenDaysConversions = newArray;
      await adminStatistic.save();
  
    } catch (error) {
      console.log(error);
    }
  };
  