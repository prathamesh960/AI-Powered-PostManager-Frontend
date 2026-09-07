"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Protected from "../../components/Protected";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Load dashboard data
  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await api("/dashboard");
        setData(result);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      }
    }

    loadDashboard();
  }, []);

  return (
    <Protected>
      <main className="container">
        {/* Page header */}
        <div className="header">
          <div>
            <h1 className="title">Dashboard</h1>
            <p className="muted">
              Overview of your GBP locations and posts.
            </p>
          </div>

          <Link
            className="btn btn-primary"
            href="/create-post"
          >
            + Create GBP Post
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Loading */}
        {!data && !error && (
          <div className="spinner">
            Loading dashboard...
          </div>
        )}

        {/* Dashboard content */}
        {data && (
          <>
            {/* Statistics */}
            <div className="grid stats">
              <div className="card">
                <div className="stat-label">
                  Total Locations
                </div>

                <div className="stat-value">
                  {data.stats.totalLocations}
                </div>
              </div>

              <div className="card">
                <div className="stat-label">
                  Total Posts
                </div>

                <div className="stat-value">
                  {data.stats.totalPosts}
                </div>
              </div>

              <div className="card">
                <div className="stat-label">
                  Draft Posts
                </div>

                <div className="stat-value">
                  {data.stats.drafts}
                </div>
              </div>

              <div className="card">
                <div className="stat-label">
                  Published Posts
                </div>

                <div className="stat-value">
                  {data.stats.published}
                </div>
              </div>
            </div>

            {/* Recent posts */}
            <div
              className="card"
              style={{ marginTop: 18 }}
            >
              <div
                className="header"
                style={{ marginBottom: 8 }}
              >
                <div>
                  <h2>Recent Posts</h2>

                  <p className="muted">
                    Latest activity.
                  </p>
                </div>

                <Link href="/posts">
                  View all
                </Link>
              </div>

              {/* No posts */}
              {data.recentPosts.length === 0 && (
                <div className="empty">
                  No posts yet. Create your first GBP post.
                </div>
              )}

              {/* Posts table */}
              {data.recentPosts.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Updated</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.recentPosts.map((post) => (
                        <tr key={post._id}>
                          <td>
                            {post.topic}
                          </td>

                          <td>
                            {post.location?.businessName ||
                              "Unknown"}
                          </td>

                          <td>
                            <span
                              className={`badge badge-${post.status}`}
                            >
                              {post.status}
                            </span>
                          </td>

                          <td>
                            {new Date(
                              post.updatedAt
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </Protected>
  );
}
