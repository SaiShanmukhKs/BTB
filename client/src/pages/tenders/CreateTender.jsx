import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Web3Context } from '../../context/Web3Context';
import { toast } from 'react-toastify';

const CreateTender = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'Construction',
    requirements: ''
  });
  
  const navigate = useNavigate();
  const { accounts, tenderFactoryContract } = useContext(Web3Context);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const tender = {
        ...formData,
        requirements: formData.requirements.split(',').map(r => r.trim())
      };

      // Call backend API to create tender
      const res = await axios.post('/api/tenders', tender);

      toast.success('Tender created successfully!');
      navigate(`/tenders/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tender creation failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Tender</h1>
      <form onSubmit={onSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input type="text" name="title" value={formData.title} onChange={onChange} required className="input" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={onChange} required className="input" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Budget (in ETH)</label>
          <input type="number" name="budget" value={formData.budget} onChange={onChange} required className="input" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Deadline</label>
          <input type="datetime-local" name="deadline" value={formData.deadline} onChange={onChange} required className="input" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select name="category" value={formData.category} onChange={onChange} className="input">
            <option value="Construction">Construction</option>
            <option value="IT Services">IT Services</option>
            <option value="Supply Chain">Supply Chain</option>
            <option value="Consulting">Consulting</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Requirements (comma-separated)</label>
          <input type="text" name="requirements" value={formData.requirements} onChange={onChange} className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Create Tender</button>
      </form>
    </div>
  );
};

export default CreateTender;
