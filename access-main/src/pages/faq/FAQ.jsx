import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axios";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  // Track which accordion item is open
  const [openId, setOpenId] = useState(null);

  // Toggle the accordion item
  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const response = await axiosInstance.get("/faqs");
      setFaqs(response.data.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/faqs/${formData._id}`, formData);
      } else {
        await axiosInstance.post("/faqs", formData);
      }
      fetchFaqs();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await axiosInstance.delete(`/faqs/${id}`);
        fetchFaqs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
      }
    }
  };

  const handleEdit = (faq) => {
    setFormData(faq);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ question: "", answer: "" });
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(faq._id)}
            >
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <div className="text-blue-500">
                {openId === faq._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {openId === faq._id && (
              <div className="mt-4 pt-2 border-t border-gray-100">
                <p className="text-gray-600">{faq.answer}</p>
                
                <div className="flex space-x-2 mt-4 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(faq);
                    }}
                    className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(faq._id);
                    }}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Answer
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQ;