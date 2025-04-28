import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TenderList = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await axios.get('/api/tenders');
        setTenders(res.data.data);
      } catch (error) {
        console.error('Error fetching tenders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading tenders...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Tenders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenders.map(tender => (
          <div key={tender._id} className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-bold mb-2">{tender.title}</h2>
            <p className="text-gray-700 mb-4">{tender.description.slice(0, 100)}...</p>
            <p className="text-gray-600 mb-2">Budget: {tender.budget} ETH</p>
            <p className="text-gray-600 mb-2">Deadline: {new Date(tender.deadline).toLocaleString()}</p>
            <Link
              to={`/tenders/${tender._id}`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenderList;
