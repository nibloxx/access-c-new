import FAQ from "../model/Faq.js";

export const createFaq = async (req, res) => {
    try {
        const faqData = req.body;
        const newFaq = await FAQ.createFaq(faqData);
        return res.status(201).json({
            success: true,
            message: 'FAQ created successfully',
            data: newFaq
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.getAllFaqs();
        return res.status(200).json({
            success: true,
            message: 'FAQs retrieved successfully',
            data: faqs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getFaqById = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findById(id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'FAQ retrieved successfully',
            data: faq
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedFaq = await FAQ.updateFaq(id, updateData);
        if (!updatedFaq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'FAQ updated successfully',
            data: updatedFaq
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFaq = await FAQ.deleteFaq(id);
        if (!deletedFaq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};