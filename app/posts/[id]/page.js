"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Protected from "../../../components/Protected";
import { api } from "../../../lib/api";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // Load post and locations
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const postData = await api(`/posts/${params.id}`);
        const locationData = await api("/locations");

        setPost(postData.post);
        setLocations(locationData.locations || []);
      } catch (err) {
        setError(
          err.message || "Unable to load post."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  // Update a post field
  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    setPost({
      ...post,
      [name]: value,
    });

    setError("");
  }

  // Get selected location ID
  function getLocationId() {
    if (!post.location) {
      return "";
    }

    if (typeof post.location === "string") {
      return post.location;
    }

    return post.location._id || "";
  }

  // Save changes
  async function savePost(event) {
    event.preventDefault();

    setError("");

    if (!post.topic || !post.topic.trim()) {
      setError("Post topic is required.");
      return;
    }

    if (!post.content || !post.content.trim()) {
      setError("Post content is required.");
      return;
    }

    setSaving(true);

    try {
      await api(`/posts/${params.id}`, {
        method: "PUT",
        body: JSON.stringify({
          locationId: getLocationId(),
          topic: post.topic,
          postType: post.postType,
          tone: post.tone,
          language: post.language,
          cta: post.cta,
          content: post.content,
        }),
      });

      router.push("/posts");
    } catch (err) {
      setError(
        err.message || "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <Protected>
        <main className="container">
          <div className="spinner">
            Loading post...
          </div>
        </main>
      </Protected>
    );
  }

  // Error if post was not loaded
  if (!post) {
    return (
      <Protected>
        <main className="container">
          <div className="error">
            {error || "Post not found."}
          </div>
        </main>
      </Protected>
    );
  }

  return (
    <Protected>
      <main className="container">
        {/* Page header */}
        <div className="header">
          <div>
            <h1 className="title">
              Edit Post
            </h1>

            <p className="muted">
              Update the content and post details.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="error"
            style={{ marginBottom: 12 }}
          >
            {error}
          </div>
        )}

        <div className="card">
          <form
            className="form"
            onSubmit={savePost}
          >
            {/* Location and topic */}
            <div className="form-grid">
              <div className="field">
                <label htmlFor="location">
                  Location
                </label>

                <select
                  id="location"
                  name="location"
                  value={getLocationId()}
                  onChange={(event) => {
                    setPost({
                      ...post,
                      location: event.target.value,
                    });
                  }}
                >
                  <option value="">
                    Select location
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location._id}
                      value={location._id}
                    >
                      {location.businessName} -{" "}
                      {location.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="topic">
                  Topic
                </label>

                <input
                  id="topic"
                  name="topic"
                  type="text"
                  value={post.topic || ""}
                  onChange={handleChange}
                  placeholder="Post topic"
                />
              </div>
            </div>

            {/* Post type and CTA */}
            <div className="form-grid">
              <div className="field">
                <label htmlFor="postType">
                  Post Type
                </label>

                <select
                  id="postType"
                  name="postType"
                  value={post.postType || "Update"}
                  onChange={handleChange}
                >
                  <option value="Update">
                    Update
                  </option>

                  <option value="Event">
                    Event
                  </option>

                  <option value="Offer">
                    Offer
                  </option>

                  <option value="Product">
                    Product
                  </option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="cta">
                  CTA
                </label>

                <select
                  id="cta"
                  name="cta"
                  value={post.cta || "None"}
                  onChange={handleChange}
                >
                  <option value="Book">
                    Book
                  </option>

                  <option value="Call">
                    Call
                  </option>

                  <option value="Learn More">
                    Learn More
                  </option>

                  <option value="Order">
                    Order
                  </option>

                  <option value="Sign Up">
                    Sign Up
                  </option>

                  <option value="Get Offer">
                    Get Offer
                  </option>

                  <option value="None">
                    None
                  </option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="field">
              <label htmlFor="content">
                Content
              </label>

              <textarea
                id="content"
                name="content"
                value={post.content || ""}
                onChange={handleChange}
                placeholder="Write your post content"
              />
            </div>

            {/* Buttons */}
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push("/posts")}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </Protected>
  );
}
