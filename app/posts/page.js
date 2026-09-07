"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Protected from "../../components/Protected";
import { api } from "../../lib/api";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (status) {
        params.set("status", status);
      }

      if (search) {
        params.set("search", search);
      }

      const data = await api(`/posts?${params.toString()}`);

      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [status]);

  async function deletePost(id) {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) {
      return;
    }

    try {
      await api(`/posts/${id}`, {
        method: "DELETE",
      });

      loadPosts();
    } catch (err) {
      setError(err.message || "Failed to delete post.");
    }
  }

  async function publishPost(id) {
    try {
      await api(`/posts/${id}/publish`, {
        method: "PATCH",
      });

      loadPosts();
    } catch (err) {
      setError(err.message || "Failed to publish post.");
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      loadPosts();
    }
  }

  return (
    <Protected>
      <main className="container">
        <div className="header">
          <div>
            <h1 className="title">Posts</h1>
          </div>

          <Link href="/create-post" className="btn btn-primary">
            + Create Post
          </Link>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="form-grid">
            <div className="field">
              <label>Search</label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search topic or content"
              />
            </div>

            <div className="field">
              <label>Status</label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={loadPosts}
          >
            Apply Search
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="spinner">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="card empty">No posts found.</div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {posts.map((post) => (
                  <tr key={post._id}>
                    <td>
                      <strong>{post.topic}</strong>

                      <div className="small muted">
                        {post.content?.slice(0, 90)}

                        {post.content && post.content.length > 90
                          ? "..."
                          : ""}
                      </div>
                    </td>

                    <td>
                      {post.location?.businessName || "Unknown"}

                      <div className="small muted">
                        {post.location?.city || ""}
                      </div>
                    </td>

                    <td>{post.postType}</td>

                    <td>
                      <span className={`badge badge-${post.status}`}>
                        {post.status}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <Link
                          className="btn btn-secondary"
                          href={`/posts/${post._id}`}
                        >
                          Edit
                        </Link>

                        {post.status === "draft" && (
                          <button
                            className="btn btn-success"
                            onClick={() => publishPost(post._id)}
                          >
                            Publish
                          </button>
                        )}

                        <button
                          className="btn btn-danger"
                          onClick={() => deletePost(post._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Protected>
  );
}