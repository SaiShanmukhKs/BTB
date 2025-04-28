// client/src/pages/bids/BidList.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BidList = () => {
  const { tenderId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await axios.get(`/api/bids/tender/${tenderId}`);
        setBids(res.data.data);
      } catch (error) {
        console.error('Error fetching bids', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [tenderId]);

  if (loading) {
    return <div className="text-center py-10">Loading bids...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Bids for Tender</h1>
      {bids.length === 0 ? (
        <div className="text-center">No bids submitted yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bids.map((bid) => (
            <div key={bid._id} className="bg-white shadow-md rounded p-6">
              <h2 className="text-xl font-semibold mb-2">{bid.proposalDetails?.title}</h2>
              <p className="text-gray-700 mb-2">{bid.amount} ETH</p>
              <p className="text-gray-600 mb-2">Bidder: {bid.bidder?.name}</p>
              <Link
                to={`/bids/${bid._id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Bid Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidList;
