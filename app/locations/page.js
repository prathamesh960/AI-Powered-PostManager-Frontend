"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Protected from "../../components/Protected";
import { api } from "../../lib/api";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load business locations
  useEffect(() => {
    async function loadLocations() {
      setLoading(true);
      setError("");

      try {
        const data = await api("/locations");

        setLocations(data.locations || []);
      } catch (err) {
        setError(
          err.message || "Unable to load locations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  return (
    <Protected>
      <main className="container">
        {/* Page header */}
        <div className="header">
          <div>
            <h1 className="title">Locations</h1>

            <p className="muted">
              Select a business location to create a GBP post.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="spinner">
            Loading locations...
          </div>
        )}

        {/* No locations */}
        {!loading && !error && locations.length === 0 && (
          <div className="empty">
            No business locations found.
          </div>
        )}

        {/* Location cards */}
        {!loading && locations.length > 0 && (
          <div className="grid two">
            {locations.map((location) => (
              <div
                className="card location-card"
                key={location._id}
              >
                <h3>
                  {location.businessName}
                </h3>

                <p>
                  <strong>Address:</strong>{" "}
                  {location.address}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {location.category}
                </p>

                <p>
                  <strong>City:</strong>{" "}
                  {location.city}
                </p>

                <div
                  className="actions"
                  style={{ marginTop: 14 }}
                >
                  <Link
                    className="btn btn-primary"
                    href={`/create-post?locationId=${location._id}`}
                  >
                    Create Post
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Protected>
  );
}
