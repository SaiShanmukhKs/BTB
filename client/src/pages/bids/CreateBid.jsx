// client/src/pages/bids/CreateBid.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Web3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CreateBid = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { accounts } = useContext(Web3Context);
  const { user } = useContext(AuthContext);

  const [amount, setAmount] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [methodology, setMethodology] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !proposalTitle || !proposalDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const proposalDetails = {
        title: proposalTitle,
        description: proposalDescription,
        timeline,
        methodology,
      };

      // Here you can later upload to IPFS and get a `proposalHash`
      const proposalHash = "dummy-proposal-hash"; // Placeholder

      const res = await axios.post('/api/bids', {
        tenderId,
        amount,
        proposalDetails,
        proposalHash,
      });

      toast.success('Bid submitted successfully!');
      navigate(`/tenders/${tenderId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit Your Bid</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Bid Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Enter bid amount"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Proposal Title</label>
          <input
            type="text"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Short title for your proposal"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Proposal Description</label>
          <textarea
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Detailed description of your bid proposal"
            rows="5"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Timeline</label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Project timeline (optional)"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Methodology</label>
          <input
            type="text"
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Methodology or approach (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
        >
          {loading ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
};

export default CreateBid;
