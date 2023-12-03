import CreativesModel from "../model/Creatives.js";

export const createCreatives = async (req, res) => {
    try {
        const {imageText, imageLink, videoText, videoLink} = req.body;
        const data = await CreativesModel.create({
            imageText,
            imageLink,
            videoText,
            videoLink
        })

        res.json(data)
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: 'Access denied'
          });
    }
}

export const updateImagesContent = async (req, res) => {
    try {
        const {valueText, valueLink} = req.body;
        const data = await CreativesModel.findOne({});

        if(!data) {
            return res.status(500).json({
                message: 'Not found'
              });
        }

        data.imageText = valueText;
        data.imageLink = valueLink;

        data.save();

        res.json(data)
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: 'Access denied'
          });
    }
}

export const updateVideosContent = async (req, res) => {
    try {
        const {valueText, valueLink} = req.body;
        const data = await CreativesModel.findOne({});

        if(!data) {
            return res.status(500).json({
                message: 'Not found'
              });
        }

        data.videoText = valueText;
        data.videoLink = valueLink;

        data.save();
        res.json(data)
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: 'Access denied'
          });
    }
}

export const getImagesAndVideosContent = async (req, res) => {
    try {
        const data = await CreativesModel.findOne({});

        if(!data) {
            return res.status(500).json({
                message: 'Not found'
              });
        }

        res.json(data);
    } catch(error) {
        console.log(error);
        res.status(500).json({
            message: 'Not found'
          });
    }
}