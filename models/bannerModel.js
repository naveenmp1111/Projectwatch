const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    bannerName: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    bannerText: {
        type: String,
        default: '' // Provide a default value if needed
    },
    bannerImage: [{
        type: String,
        default: '' // Provide a default value if needed
    }]
});

module.exports = mongoose.model('Banner', bannerSchema);
