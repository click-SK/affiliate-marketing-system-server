import mongoose from "mongoose";

const ArchiheChartsMonthSchema = new mongoose.Schema({
    partnerId: String,
    chartsMonth: {
        buys: [
          {
            date: String,
            number: Number,
            quantity: {
              type: Number,
              default: 0
            }
          },
        ],
        clicks: [
          {
            date: String,
            number: Number,
          },
        ],
        conversions: [
          {
            date: String,
            number: Number,
          },
        ],
      },
}, { timestamps: true });

export default mongoose.model('ArchiheChartsMonth',ArchiheChartsMonthSchema)