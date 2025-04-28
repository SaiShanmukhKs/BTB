// client/src/pages/tenders/TenderDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const TenderDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const res = await axios.get(`/api/tenders/${id}`);
        setTender(res.data.data);
      } catch (error) {
        console.error('Error fetching tender', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBids = async () => {
      try {
        const res = await axios.get(`/api/bids/tender/${id}`);
        setBids(res.data.data);
      } catch (error) {
        console.error('Error fetching bids', error);
      } finally {
        setBidsLoading(false);
      }
    };

    fetchTender();
    fetchBids();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading tender details...</div>;
  }

  if (!tender) {
    return <div className="text-center py-10">Tender not found.</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">{tender.title}</h1>
      <p className="text-gray-700 mb-4">{tender.description}</p>
      <p className="text-gray-600 mb-2">Budget: {tender.budget} ETH</p>
      <p className="text-gray-600 mb-2">Deadline: {new Date(tender.deadline).toLocaleString()}</p>
      <p className="text-gray-600 mb-4">Category: {tender.category}</p>

      {/* Show Create Bid button for bidders */}
      {user && user.role === 'bidder' && (
        <div className="my-4">
          <Link
            to={`/bids/create/${tender._id}`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit a Bid
          </Link>
        </div>
      )}

      {/* List of bids */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Submitted Bids</h2>
        {bidsLoading ? (
          <div>Loading bids...</div>
        ) : bids.length === 0 ? (
          <div>No bids submitted yet.</div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div key={bid._id} className="border rounded p-4">
                <p className="font-semibold">Bidder: {bid.bidder.name} ({bid.bidder.organization})</p>
                <p>Amount: {bid.amount} ETH</p>
                <Link
                  to={`/bids/${bid._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Bid Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails;
