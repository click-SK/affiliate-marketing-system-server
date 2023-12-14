import PaymantsMethodModel from "../model/PaymantsMethod.js";

export const createPaymantMethod = async (req,res) => {
    try {
        const {name} = req.body;

        const paymant = await PaymantsMethodModel.create({
            name
        })

        if(!paymant) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.json(paymant)
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getAllPaymantsMethod = async (req,res) => {
    try {
        let paymant = await PaymantsMethodModel.find();

        if(!paymant) {
           return res.status(404).json({ message: 'Paymants Not fount' });
        }

        paymant.reverse();

        console.log('paymant',paymant);

        res.json(paymant)
    } catch(error) {
        console.log(error);
        res.status(404).json({ message: 'Paymants Not fount' });
    }
}

export const updatePaymantMethod = async (req,res) => {
    try {
        const {id, name} = req.body;
        const paymant = await PaymantsMethodModel.findById(id)

        if(!paymant) {
            res.status(404).json({ message: 'Paymants Not fount' });
        }

        paymant.name = name;

        paymant.save();

        res.json(paymant)
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const deletePaymantMethod = async (req,res) => {
    try {
        const {id} = req.query;
        console.log('id',id);
        const paymant = await PaymantsMethodModel.findByIdAndDelete(id);

        if(!paymant) {
            res.status(404).json({ message: 'Paymants Not fount' });
        }

        res.json({ message: 'Succeed Deleted' })
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}