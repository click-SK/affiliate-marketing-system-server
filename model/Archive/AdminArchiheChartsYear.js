import mongoose from "mongoose";

const AdminArchiheChartsYearSchema = new mongoose.Schema({
    chartsYear: {
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

export default mongoose.model('AdminArchiheChartsYear',AdminArchiheChartsYearSchema)