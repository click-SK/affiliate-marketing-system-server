import UserModel from '../model/User.js';
// import ImageStoreModel from '../model/ImageStorage.js';
import PartnerStatistic from '../model/PartnerStatistic.js';
import * as Service from '../services/services.js';
import * as ParthnerStatisticService from '../services/ParthnerStatisticService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const kyivTime = moment().tz('Europe/Kiev');
const formattedDate = kyivTime.format('DD.MM.YYYY');

export const createPartnerStatistic = async (userId) => {
  try {
    const statistics = await PartnerStatistic.create({
      partnerId: userId,
      event: [
        {
          date: formattedDate,
          clicks: [],
          buys: [],
        }
      ],
    });
    await ParthnerStatisticService.createDefaultChartMonthOnePartner(statistics._id)
    await ParthnerStatisticService.createDefaultChartYearOnePartner(statistics._id)
    await ParthnerStatisticService.createDefaultChartAllYearsOnePartner(statistics._id)
    await ParthnerStatisticService.createChartSevenDaysOnePartner(statistics._id)
    return statistics;
  } catch(error) {
    console.error('Помилка при створенні статистики:', error);
  }
}

export const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const canditate = await UserModel.findOne({ email });

        if (canditate) {
          return res.status(500).json({ message: 'Email already exists' });
        }

        const user = await UserModel.create({
            email,
            name,
            link: '',
            promotionalCode: '',
            isAdmin: false,
            isPartner: true,
            disabled: false,
            password: hash,
        });

        const link = Service.generateRandomLink(user._id);
        const promotionalCode = Service.generateRandomPromoCode(user._id);

        const statistics = await createPartnerStatistic(user._id);
        user.statistics = statistics._id;
        user.link = link;
        user.promotionalCode = promotionalCode;
        await user.save();

        // if(user) {
        //   createPartnerStatistic(user._id)
        // }

        const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, { expiresIn: '30d' });

        const { password: hashedPassword, ...userData } = user.toObject();
        
        res.json({ ...userData, token });

    } catch (error) {
        console.error('Помилка реєстрації користувача:', error);
        res.status(500).json({ message: 'Не вдалося зареєструвати користувача' });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});
        if(!user) {
            return res.status(404).json({
                message: 'User not found',
            })
        }

        if(user.disabled) {
          return res.status(404).json({
              message: 'User disabled',
          })
      }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.password);

        if(!isValidPass) {
            return res.status(400).json({
                message: 'Password or email wrong',
            })
        }

        const token = jwt.sign(
          { id: user._id},
          process.env.TOKEN_KEY,
          { expiresIn: '30d' }
        );

        const {passwordDoc, ...userData} = user._doc

        await user.save();

        res.json({...userData, token})
    } catch(e) {
        console.log(e);
    }
}

export const getMe = async (req, res) => {
    try {
      const user = await UserModel.findById(req.userId)
      .populate('statistics');
  
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
  
      const { password, ...userData } = user._doc;
      res.json(userData);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  export const updateData = async (req, res) => {
    try {
      const {id, email, name, password} = req.body;

      const user = await UserModel.findById(id);

      if(!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const candidate = await UserModel.findOne({ email });

      if (candidate && candidate._id != id) {
        return res.status(500).json({ message: 'Email already exists' });
      }

      if(password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        user.password = hash;
      }
      user.email = email;
      user.name = name;


      await user.save();

      res.json(user)

    } catch(error) {
      console.log(e);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  export const getAllUsers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
  
      const skip = (page - 1) * limit;
      const userData = await UserModel.find().skip(skip).limit(limit).populate('statistics');

      res.json(userData.slice(1));
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  };

  // export const searchUsers = async (req, res) => {
  //   try {
  //     const { page, limit, search } = req.query;
  
  //     let skip = (page - 1) * limit;

  //     console.log('skip',skip);
      // // Виключення адміністраторів з результатів пошуку
      // const query = {
      //   ...search ? { name: new RegExp(search, 'i') } : {},
      //   isAdmin: { $ne: true } // Додаємо умову, щоб ігнорувати адміністраторів
      // };
  
      // const users = await UserModel.find(query).skip(skip).limit(limit)
      // .populate('statistics')
  
      // res.json(users);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // };

  export const searchUsers = async (req, res) => {
    try {
      let { page, limit, search } = req.query;

      // Переконуємося, що page та limit є числами і не менше 1
      page = Math.max(Number(page) || 1, 1);
      limit = Math.max(Number(limit) || 10, 1);

      let skip = (page - 1) * limit;

      // Перевірка на випадок, якщо skip вийшов від'ємним
      if (skip < 0) skip = 0;

      // Виключення адміністраторів з результатів пошуку
      const query = {
        ...(search ? { name: new RegExp(search, "i") } : {}),
        isAdmin: { $ne: true }, // Додаємо умову, щоб ігнорувати адміністраторів
      };

      const users = await UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("statistics");

      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const updateUserBalance = async (req, res) => {
    try {
      const {id, newBalance} = req.body;
      const user = await UserModel.findById(id);
      user.balance = newBalance;

      await user.save();

      res.json(user);
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  export const updateUserBonuse = async (req, res) => {
    try {
      const {id, newBonus} = req.body;
      const user = await UserModel.findById(id);
      user.bonus = newBonus;

      await user.save();

      res.json(user);
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  export const updateUserLink = async (req, res) => {
    try {
      const {id} = req.body;
      const user = await UserModel.findById(id);
      const newLink = Service.generateRandomLink(id);
      user.link = newLink;

      await user.save();

      res.json(user);
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  export const updateUserPromotionalCode = async (req, res) => {
    try {
      const {id} = req.body;
      const user = await UserModel.findById(id);
      const newCode = Service.generateRandomPromoCode(id);
      user.promotionalCode = newCode;

      await user.save();

      res.json(user);
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }

  // export const dowloadBigBaner = async (req, res) => {
  //   try {
  //     const imageStore = await ImageStoreModel.findOne();

  //     const __filename = fileURLToPath(import.meta.url);

  //     const __dirname = dirname(__filename);
  
  //     const filePath = path.join(__dirname, "..", imageStore.BigBanner); // Отримайте шлях до файлу

  //     if (filePath) {
  //       return res.download(filePath);
  //     }
  //     return res.status(400).json({ message: "Dowload error" });

  //   } catch(error) {
  //     console.log(error);
  //     res.status(400).json({
  //       message: 'Dowload Error'
  //     });
  //   }
  // }
  // export const dowloadMiddleBaner = async (req, res) => {
  //   try {
  //     const imageStore = await ImageStoreModel.findOne();

  //     const __filename = fileURLToPath(import.meta.url);

  //     const __dirname = dirname(__filename);
  
  //     const filePath = path.join(__dirname, "..", imageStore.MiddleBanner); // Отримайте шлях до файлу

  //     if (filePath) {
  //       return res.download(filePath);
  //     }
  //     return res.status(400).json({ message: "Dowload error" });

  //   } catch(error) {
  //     console.log(error);
  //     res.status(400).json({
  //       message: 'Dowload Error'
  //     });
  //   }
  // }
  // export const dowloadSmallBaner = async (req, res) => {
  //   try {
  //     const imageStore = await ImageStoreModel.findOne();

  //     const __filename = fileURLToPath(import.meta.url);

  //     const __dirname = dirname(__filename);
  
  //     const filePath = path.join(__dirname, "..", imageStore.SmallBanner); // Отримайте шлях до файлу

  //     if (filePath) {
  //       return res.download(filePath);
  //     }
  //     return res.status(400).json({ message: "Dowload error" });

  //   } catch(error) {
  //     console.log(error);
  //     res.status(400).json({
  //       message: 'Dowload Error'
  //     });
  //   }
  // }

  // export const getAllBanners = async (req, res) => {
  //   try {
  //     const imageStorege = await ImageStoreModel.findOne();

  //     if(!imageStorege) {
  //       res.status(404).json({
  //         message: 'Files not found'
  //       });
  //     }

  //     res.json(imageStorege);
  //   } catch(error) {
  //     console.log(error);
  //     res.status(404).json({
  //       message: 'Files not found'
  //     });
  //   }
  // }

  export const updateWalletAddress = async (req, res) => {
    try {
      const {address, id} = req.body;

      const user = await UserModel.findById(id);

      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      user.walletAddress = address;
      user.save();

      res.json(user)
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Access denied'
      });
    }
  }