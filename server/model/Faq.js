import mongoose from 'mongoose';


const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update the updatedAt timestamp
faqSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static methods for FAQ operations
faqSchema.statics = {
    // Create new FAQ
    async createFaq(faqData) {
        return await this.create(faqData);
    },

    // Get all FAQs
    async getAllFaqs() {
        return await this.find({ isActive: true }).sort({ createdAt: -1 });
    },

    // Update FAQ
    async updateFaq(id, updateData) {
        return await this.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    },

    // Delete FAQ (soft delete)
    async deleteFaq(id) {
        return await this.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }
};

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;