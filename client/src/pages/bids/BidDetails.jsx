// client/src/pages/bids/BidDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const BidDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBid = async () => {
      try {
        const res = await axios.get(`/api/bids/${id}`);
        setBid(res.data.data);
      } catch (error) {
        console.error('Error fetching bid', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBid();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading bid details...</div>;
  }

  if (!bid) {
    return <div className="text-center py-10">Bid not found.</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">{bid.proposalDetails?.title}</h1>
      <p className="text-gray-700 mb-4">{bid.proposalDetails?.description}</p>

      <div className="mb-4">
        <p><span className="font-semibold">Bid Amount:</span> {bid.amount} ETH</p>
        <p><span className="font-semibold">Bidder:</span> {bid.bidder?.name} ({bid.bidder?.organization})</p>
        <p><span className="font-semibold">Submitted:</span> {new Date(bid.createdAt).toLocaleString()}</p>
        <p><span className="font-semibold">Proposal Timeline:</span> {bid.proposalDetails?.timeline || "N/A"}</p>
        <p><span className="font-semibold">Methodology:</span> {bid.proposalDetails?.methodology || "N/A"}</p>
      </div>

      {/* Optionally: Show attached documents */}
      {bid.documents && bid.documents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Attached Documents</h2>
          <ul className="list-disc list-inside">
            {bid.documents.map((doc, idx) => (
              <li key={idx}>
                <a
                  href={`https://ipfs.io/ipfs/${doc.fileHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BidDetails;
