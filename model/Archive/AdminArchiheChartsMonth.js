import mongoose from "mongoose";

const AdminArchiheChartsMonthSchema = new mongoose.Schema({
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

export default mongoose.model('AdminArchiheChartsMonth',AdminArchiheChartsMonthSchema)