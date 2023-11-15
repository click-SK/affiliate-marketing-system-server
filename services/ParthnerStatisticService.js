import * as Services from "./services.js";
import PartnerStatisticModel from "../model/PartnerStatistic.js";
import UserModel from "../model/User.js";
import moment from "moment-timezone";
import { CronJob } from "cron";
const kyivTime = moment().tz("Europe/Kiev");
const formattedDate = kyivTime.format("DD.MM.YYYY");
const currentYear = kyivTime.format("YYYY");

const codes = [
  {
    codesId: "0",
    date: "07.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "1",
    date: "07.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "2",
    date: "08.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "3",
    date: "09.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "4",
    date: "10.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "5",
    date: "10.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "6",
    date: "11.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "7",
    date: "12.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "8",
    date: "13.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "9",
    date: "13.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "10",
    date: "14.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
  {
    codesId: "11",
    date: "16.11.2023",
    value: 10,
    code: "nb6bu411p",
  },
];

export const createDefaultEvent = async () => {
  try {
    const allPartners = (await UserModel.find()).splice(1); // Видалив .splice(1), щоб не пропускати першого користувача.

    for (const user of allPartners) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }

      const partnerId = user._id.toString();
      const statistic = await PartnerStatisticModel.findOne({ partnerId });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }

      const today = moment().subtract(0, "day").format("DD.MM.YYYY");

      if(statistic.event[statistic.event.length - 1].date != today) {
        statistic.event.push({
          date: today,
          clicks: [],
          buys: []
        })
      }
      await statistic.save();
    }

  } catch(error) {

  }
}

// export const handleBuy = async () => {
//   try {
//     console.log('handleBuy',handleBuy);
//     const response = await fetch('https://makenude.ai/api/affiliate?token=49114cade64b696c26hf854d068c374ac1ab3d4');
//     const responseBuys = await response.json();

//     const resoultArray =  [];
//     responseBuys.subscriptions.forEach((item) => {
//       if(item.promocode) {
//         const date = moment(item.created_at);
//         const formattedDate = date.format("DD.MM.YYYY");
//         resoultArray.push({
//           codesId: item.created_at,
//           date: formattedDate,
//           value: item.price,
//           code: item.promocode,
//         })
//       }
//     });

//     if(resoultArray.length) {
//     for (const item of resoultArray) {
//       const partner = await UserModel.findOne({ promotionalCode: item.code });
//       if (!partner) {
//         console.log("No partner found for the code:", item.code);
//         continue;
//       }

//       const partnerId = partner._id;
//       const statistic = await PartnerStatisticModel.findOne({ partnerId });

//       if (!statistic) {
//         console.log("No statistics found for partner:", partnerId);
//         continue;
//       }

//       const uniqueArrayId = [
//         ...new Set(statistic.event.flatMap(parent => parent.buys.map(child => child.buyId)))
//       ];

//       const yesterday = moment().subtract(1, "day").format("DD.MM.YYYY");
//       const yesterdayEvent = statistic.event.filter(
//         (item) => item.date == yesterday
//       );
//       if(!yesterdayEvent.length && !uniqueArrayId.includes(item.codesId)) {
//         statistic.event.push({
//           date: yesterday,
//           clicks: [],
//           buys: [{
//             date: yesterday,
//             buyId: item.codesId
//           }]
//         })
//       }

//       console.log('yesterdayEvent',yesterdayEvent);

//       if(!uniqueArrayId.includes(item.codesId) && yesterdayEvent.length) {
//         yesterdayEvent[0].buys.push({
//           date: yesterday,
//           buyId: item.codesId
//         })
//       }

//       let balanceValue = partner.balance;

//       if(!uniqueArrayId.includes(item.codesId)) {
//         balanceValue += item.value * (partner.bonus / 100);
//         // console.log('balanceValue',balanceValue);
//       }
//       console.log('balanceValue',balanceValue);
//       if(partner.balance != balanceValue) {
//         console.log('work not equal');
//         partner.balance = balanceValue;
//       await partner.save();
//       }
//       // await statistic.save();
//     }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

export const handleBuy = async () => {
  try {
    for (const item of codes) {
      const partner = await UserModel.findOne({ promotionalCode: item.code });
      if (!partner) {
        console.log("No partner found for the code:", item.code);
        continue;
      }

      const partnerId = partner._id;
      const statistic = await PartnerStatisticModel.findOne({ partnerId });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }

      const uniqueArrayId = [
        ...new Set(statistic.event.flatMap(parent => parent.buys.map(child => child.buyId)))
      ];

      const yesterday = moment().subtract(1, "day").format("DD.MM.YYYY");
      // const yesterday = '16.11.2023';


      const yesterdayEvent = statistic.event.filter(
        (item) => item.date == yesterday
      );
      if(!yesterdayEvent.length && !uniqueArrayId.includes(item.codesId)) {
        statistic.event.push({
          date: yesterday,
          clicks: [],
          buys: [{
            date: yesterday,
            buyId: item.codesId
          }]
        })
      }

      if(!uniqueArrayId.includes(item.codesId) && yesterdayEvent.length) {
        yesterdayEvent[0].buys.push({
          date: yesterday,
          buyId: item.codesId
        })
      }

      let balanceValue = partner.balance;

      if(!uniqueArrayId.includes(item.codesId)) {
        balanceValue += item.value * (partner.bonus / 100);
      }
      if(partner.balance != balanceValue) {
        partner.balance = balanceValue;
      await partner.save();
      }
      await statistic.save();
    }
  } catch (error) {
    console.log(error);
  }
};

// Обчислення числових значень

export const handleCalculateNumbersStatisticsPartner = async () => {
  try {
    const allPartners = (await UserModel.find()).splice(1); // Видалив .splice(1), щоб не пропускати першого користувача.

    for (const user of allPartners) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }

      const partnerId = user._id.toString();
      const statistic = await PartnerStatisticModel.findOne({ partnerId });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }

      // Обчислення для покупок
      let allBuys = statistic.buysAllPeriod || 0; // Додавання || 0 для застереження undefined значення
      let monthBuys = statistic.buysMonth || 0;

      // Обчислення для кліків
      let allClicks = statistic.clicksAllPeriod || 0;
      let allConversions = 0;
      let monthClicks = statistic.clicksMonth || 0;

      const yesterday = moment().subtract(1, "day").format("DD.MM.YYYY");
      const yesterdayEvent = statistic.event.filter(
        (item) => item.date == yesterday
      );

      if(!yesterdayEvent.length) {
        console.log("No statistics found");
        continue;
      }

      // Для покупок
      let numberBuys = yesterdayEvent[0].buys.length;
      allBuys += numberBuys;
      monthBuys += numberBuys;

      // Для кліків
      let numberClicks = yesterdayEvent[0].clicks.length;
      allClicks += numberClicks;
      monthClicks += numberClicks;

      if(allClicks && allBuys) {
        allConversions = (allBuys / allClicks) * 100;
      }
      // Оновлення статистики
      statistic.buysAllPeriod = allBuys;
      statistic.buysMonth = monthBuys;
      statistic.clicksAllPeriod = allClicks;
      statistic.clicksMonth = monthClicks;
      statistic.conversionAllPeriod = allConversions.toFixed(1);

      await statistic.save();
    }
  } catch (error) {
    console.error("Error during statistics calculation for partner:", error);
  }
};

// Очищення числових значень - місяць
export const clearMonthDataAllParthner = async () => {
  try {
    const allPartner = (await UserModel.find()).splice(1);
    for (const user of allPartner) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }
      const partnerId = user._id.toString();

      const statistic = await PartnerStatisticModel.findOne({ partnerId });
      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }
      statistic.buysMonth = 0;
      statistic.clicksMonth = 0;
      await statistic.save();
    }
  } catch (error) {
    console.log(error);
  }
};

// Створення пустого місячного графіка

export const createDefaultChartMonth = async () => {
  const daysOfCurrentMonth = Services.getDaysArrayForCurrentMonth();
  const defaultArray = [];
  daysOfCurrentMonth.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });
  const allPartner = (await UserModel.find()).splice(1);

  for (const user of allPartner) {
    if (!user._id) {
      console.log("No partner found for the code:", user._id);
      continue;
    }

    const partnerId = user._id.toString();
    const statistic = await PartnerStatisticModel.findOne({ partnerId });

    if (!statistic) {
      console.log("No statistics found for partner:", partnerId);
      continue;
    }

    statistic.chartsMonth.clicks = defaultArray;
    statistic.chartsMonth.buys = defaultArray;
    statistic.chartsMonth.conversions = defaultArray;
    await statistic.save();
  }

};

// Наповнення місячного графіка

export const fillingCartMonth = async () => {
  try {
    // Встановіть часовий пояс на Київ
    moment.tz.setDefault("Europe/Kiev");

    // Отримайте вчорашню дату
    // let yesterdayFull = moment().subtract(1, "day").format("DD.MM.YYYY");
    // const yesterday = yesterdayFull.split('.')[0];

    let yesterdayFull = '16.11.2023';
    const yesterday = '16';


    const allPartner = await UserModel.find();

    for (const user of allPartner) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }

      const partnerId = user._id.toString();
      // Знайдіть статистику партнера за його ID та вчорашню дату
      const statistic = await PartnerStatisticModel.findOne({
        partnerId,
      });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }

      const yesterdayEvent = statistic.event.filter(
        (item) => item.date == yesterdayFull
      );

      if (!yesterdayEvent.length) {
        console.log("Statistic not found");
        continue;
      }

      const clicksNumber = yesterdayEvent[0].clicks.length;
      const buysNumber = yesterdayEvent[0].buys.length;

      let conversionsNumber = 0;

      if (buysNumber && clicksNumber) {
        conversionsNumber = (buysNumber / clicksNumber) * 100;
      } else if (buysNumber > 0 && clicksNumber == 0) {
        conversionsNumber = 100;
      }

      let entryToUpdateClicks = statistic.chartsMonth.clicks.find(
        (item) => item.date === yesterday
      );

      let entryToUpdateBuys = statistic.chartsMonth.buys.find(
        (item) => item.date === yesterday
      );

      let entryToUpdateConversions = statistic.chartsMonth.conversions.find(
        (item) => item.date === yesterday
      );

        entryToUpdateClicks.number = clicksNumber;
        entryToUpdateBuys.number = buysNumber;
        entryToUpdateConversions.number = conversionsNumber.toFixed(1);

      // Після змін, зберігаємо оновлену статистику
      await statistic.save();
    }
  } catch (err) {
    console.error(err);
  }
};

// Створення пустого річного графіка

export const createDefaultChartYear = async () => {
  const monthCurrentYears = Services.getMonthArrayForYear();
  const defaultArray = [];

  monthCurrentYears.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });

  const allPartner = (await UserModel.find()).splice(1);

  for (const user of allPartner) {
    if (!user._id) {
      console.log("No partner found for the code:", user._id);
      continue;
    }

    const partnerId = user._id.toString();
    const statistic = await PartnerStatisticModel.findOne({ partnerId });

    if (!statistic) {
      console.log("No statistics found for partner:", partnerId);
      continue;
    }

    statistic.chartsYear.clicks = defaultArray;
    statistic.chartsYear.buys = defaultArray;
    statistic.chartsYear.conversions = defaultArray;

    await statistic.save();
  }
};

// Наповнення річного графіка

export const calculataLastMonthToYearChart = async () => {
  try {
    const allPartner = (await UserModel.find()).splice(1);
    for (const user of allPartner) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }
      const partnerId = user._id.toString();

      const statistic = await PartnerStatisticModel.findOne({ partnerId });
      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }
      let clicksCurrentMonth = 0;
      let buysCurrentMonth = 0;
      let conversionCurrentMonth = 0;
      let month = moment().subtract(1, 'months').format("MM");
      statistic.chartsMonth.clicks.forEach((click) => {
        clicksCurrentMonth += click.number;
      });
      statistic.chartsMonth.buys.forEach((buy) => {
        buysCurrentMonth += buy.number;
      });

      if (clicksCurrentMonth && buysCurrentMonth) {
        conversionCurrentMonth = (buysCurrentMonth / clicksCurrentMonth) * 100;
      }

      const currentMonthBuysItem = statistic.chartsYear.buys.find((item) => {
        return item.date === month;
      });
      const currentMonthClicksItem = statistic.chartsYear.clicks.find((item) => {
        return item.date === month;
      });
      const currentMonthConversionsItem = statistic.chartsYear.conversions.find((item) => {
        return item.date === month;
      });

      currentMonthBuysItem.number = buysCurrentMonth;
      currentMonthClicksItem.number = clicksCurrentMonth;
      currentMonthConversionsItem.number = ((buysCurrentMonth / clicksCurrentMonth) * 100).toFixed(1);

      await statistic.save();
    }
  } catch (error) {
    console.log("error", error);
  }
};

// Створення пустого графіка за весь період

export const createDefaultChartAllYears = async () => {
  const monthCurrentYears = Services.getAllPeriodArray();
  const defaultArray = [];

  monthCurrentYears.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });

  const allPartner = (await UserModel.find()).splice(1);

  for (const user of allPartner) {
    if (!user._id) {
      console.log("No partner found for the code:", user._id);
      continue;
    }

    const partnerId = user._id.toString();
    const statistic = await PartnerStatisticModel.findOne({ partnerId });

    if (!statistic) {
      console.log("No statistics found for partner:", partnerId);
      continue;
    }

    statistic.chartsYearAllPeriod.clicks = defaultArray;
    statistic.chartsYearAllPeriod.buys = defaultArray;
    statistic.chartsYearAllPeriod.conversions = defaultArray;

    await statistic.save();
  }
};

// Наповнення графіка за весь період

export const calculateChartAllYears = async () => {
  try {
    const allPartner = (await UserModel.find()).splice(1);
    // const previousYear = kyivTime.subtract(1, 'years').format("YYYY");
    const previousYear = '2023';
    for (const user of allPartner) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }
      const partnerId = user._id.toString();

      const statistic = await PartnerStatisticModel.findOne({ partnerId });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }

      let clicksCurrentYear = statistic.chartsYear.clicks.reduce((acc, current) => acc + current.number, 0);
      let buysCurrentYear = statistic.chartsYear.buys.reduce((acc, current) => acc + current.number, 0);
      let conversionCurrentYear = 0;

      let actualBuysItem = statistic.chartsYearAllPeriod.buys.filter((item) => item.date == previousYear);
      let actualClicksItem = statistic.chartsYearAllPeriod.clicks.filter((item) => item.date == previousYear);
      let actualConversionsItem = statistic.chartsYearAllPeriod.conversions.filter((item) => item.date == previousYear);

      if(buysCurrentYear && clicksCurrentYear) {
        conversionCurrentYear = (buysCurrentYear / clicksCurrentYear) * 100;
      }

      actualBuysItem[0].number = buysCurrentYear;
      actualClicksItem[0].number = clicksCurrentYear;
      actualConversionsItem[0].number = conversionCurrentYear.toFixed(1);

      await statistic.save();
    }
  } catch(error) {
    console.log('error',error);
  }
};

// Наповнення 7 денного графіка

export const createChartSevenDays = async () => {
  try {
    const allPartner = (await UserModel.find()).splice(1);
    for (const user of allPartner) {
      if (!user._id) {
        console.log("No partner found for the code:", user._id);
        continue;
      }

      const partnerId = user._id.toString();
      const statistic = await PartnerStatisticModel.findOne({ partnerId });

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
        continue;
      }
      const clicksArray = [];
      const buysArray = [];
      const conversionsArray = [];

      if(!statistic.event.length) {
        console.log("Statistic not found");
        continue;
      }

      const lastSevenDays = statistic.event.slice(-7);

      if(lastSevenDays.length != 7) {
        const lastEvent = statistic.event;
        const chartLastSevenDays = statistic.lastSevenDays;

        chartLastSevenDays.clicks.forEach((item,index) => {
          lastEvent.forEach((event) => {
            if(event.date.split('.')[0] == item.date) {
              chartLastSevenDays.buys[index].number = event.buys.length;
              chartLastSevenDays.clicks[index].number = event.clicks.length;

              if(event.buys.lengt && event.clicks.length) {
                chartLastSevenDays.conversions[index].number = (event.buys.length / event.clicks.length) * 100;
              } else if (event.buys.length > 0 && event.clicks.length == 0) {
                chartLastSevenDays.conversions[index].number = 100;
              }
            }
          })
        })
  
        statistic.lastSevenDays.buys = chartLastSevenDays.buys;
        statistic.lastSevenDays.clicks = chartLastSevenDays.clicks;
        statistic.lastSevenDays.conversions = chartLastSevenDays.conversions;

        await statistic.save();
        continue;
      }
      
      lastSevenDays.forEach((item) => {
        let iterationConversion = 0;
        let iterationDate = item.date.split('.')[0];
        clicksArray.push({
          date: iterationDate,
          number: item.clicks.length
        })
        buysArray.push({
          date: iterationDate,
          number: item.buys.length
        })

        if(item.buys.length && item.clicks.length) {
          iterationConversion = (item.buys.length / item.clicks.length) * 100;
        } else if (item.buys.length > 0 && item.clicks.length == 0) {
          iterationConversion = 100;
        }

        conversionsArray.push({
          date: iterationDate,
          number: iterationConversion.toFixed(1)
        })
      })

      statistic.lastSevenDays.clicks = clicksArray;
      statistic.lastSevenDays.buys = buysArray;
      statistic.lastSevenDays.conversions = conversionsArray;

      await statistic.save();
    }
  } catch(error) {
    console.log(error);
  }
}

// Створення пустого місячного графіка для одного партнера

export const createDefaultChartMonthOnePartner = async (id) => {
  const daysOfCurrentMonth = Services.getDaysArrayForCurrentMonth();
  const defaultArray = [];
  daysOfCurrentMonth.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });

    const statistic = await PartnerStatisticModel.findById(id);

    if (!statistic) {
      console.log("No statistics found for partner:", partnerId);
    }

    statistic.chartsMonth.clicks = defaultArray;
    statistic.chartsMonth.buys = defaultArray;
    statistic.chartsMonth.conversions = defaultArray;
    await statistic.save();
};

// Створення пустого річного графіка для одного партнера

export const createDefaultChartYearOnePartner = async (id) => {
  const monthCurrentYears = Services.getMonthArrayForYear();
  const defaultArray = [];

  monthCurrentYears.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });

  const statistic = await PartnerStatisticModel.findById(id);

    if (!statistic) {
      console.log("No statistics found for partner:", id);
    }

    statistic.chartsYear.clicks = defaultArray;
    statistic.chartsYear.buys = defaultArray;
    statistic.chartsYear.conversions = defaultArray;

    await statistic.save();
  };

// Створення пустого графіка за весь період для одного партнера

export const createDefaultChartAllYearsOnePartner = async (id) => {
  const monthCurrentYears = Services.getAllPeriodArray();
  const defaultArray = [];

  monthCurrentYears.forEach((item) => {
    defaultArray.push({
      date: item,
      number: 0,
    });
  });



    const statistic = await PartnerStatisticModel.findById(id);

    if (!statistic) {
      console.log("No statistics found for partner:", partnerId);
    }

    statistic.chartsYearAllPeriod.clicks = defaultArray;
    statistic.chartsYearAllPeriod.buys = defaultArray;
    statistic.chartsYearAllPeriod.conversions = defaultArray;

    await statistic.save();
};

// Наповнення 7 денного графіка для одного партнера

export const createChartSevenDaysOnePartner = async (id) => {
  try {
    const monthCurrentYears = Services.getLastSevenDays();
    const defaultArray = [];
  
    monthCurrentYears.forEach((item) => {
      defaultArray.push({
        date: item,
        number: 0,
      });
    });
    
    const statistic = await PartnerStatisticModel.findById(id);

      if (!statistic) {
        console.log("No statistics found for partner:", partnerId);
      } 

      statistic.lastSevenDays.clicks = defaultArray;
      statistic.lastSevenDays.buys = defaultArray;
      statistic.lastSevenDays.conversions = defaultArray;
      await statistic.save();

  } catch(error) {
    console.log(error);
  }
}