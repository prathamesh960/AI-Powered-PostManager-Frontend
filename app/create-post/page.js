"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Protected from "../../components/Protected";
import { api } from "../../lib/api";

const emptyForm = {
  locationId: "",
  topic: "",
  postType: "Update",
  tone: "Professional",
  language: "English",
  cta: "None",
  content: "",
};

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState(emptyForm);
  const [locations, setLocations] = useState([]);

  const [showPreview, setShowPreview] = useState(false);

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load business locations from the backend
  useEffect(() => {
    async function loadLocations() {
      setLoadingLocations(true);
      setError("");

      try {
        const data = await api("/locations");

        const locationList = data.locations || [];
        setLocations(locationList);

        const locationFromUrl = searchParams.get("locationId");

        if (locationFromUrl) {
          setForm((currentForm) => ({
            ...currentForm,
            locationId: locationFromUrl,
          }));
        } else if (locationList.length > 0) {
          setForm((currentForm) => ({
            ...currentForm,
            locationId: locationList[0]._id,
          }));
        }
      } catch (err) {
        setError(err.message || "Unable to load locations.");
      } finally {
        setLoadingLocations(false);
      }
    }

    loadLocations();
  }, [searchParams]);

  // Find the selected business location
  let selectedLocation = null;

  for (const location of locations) {
    if (location._id === form.locationId) {
      selectedLocation = location;
      break;
    }
  }

  // Update form fields
  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    setForm({
      ...form,
      [name]: value,
    });

    setError("");
    setMessage("");
  }

  // Generate post content using AI
  async function generateContent() {
    if (!form.locationId) {
      setError("Please select a business location.");
      return;
    }

    if (!form.topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoadingAI(true);
    setError("");
    setMessage("");

    try {
      const data = await api("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          locationId: form.locationId,
          topic: form.topic,
          postType: form.postType,
          tone: form.tone,
          language: form.language,
        }),
      });

      setForm({
        ...form,
        content: data.content,
      });

      setMessage(
        "AI content generated. You can edit the content before saving."
      );
    } catch (err) {
      setError(err.message || "Unable to generate content.");
    } finally {
      setLoadingAI(false);
    }
  }

  // Save post as draft or published
  async function savePost(status) {
    setError("");
    setMessage("");

    if (!form.locationId) {
      setError("Please select a business location.");
      return;
    }

    if (!form.topic.trim()) {
      setError("Please enter a post topic.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter post content.");
      return;
    }

    setSaving(true);

    try {
      const data = await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          locationId: form.locationId,
          topic: form.topic,
          postType: form.postType,
          tone: form.tone,
          language: form.language,
          cta: form.cta,
          content: form.content,
          status: status,
        }),
      });

      if (status === "published") {
        setMessage("Post marked as published.");
      } else {
        setMessage("Draft saved successfully.");
      }

      setTimeout(() => {
        router.push(`/posts?highlight=${data.post._id}`);
      }, 500);
    } catch (err) {
      setError(err.message || "Unable to save post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected>
      <main className="container">
        {/* Page heading */}
        <div className="header">
          <div>
            <h1 className="title">Create GBP Post</h1>
            <p className="muted">
              Create, generate, review and save your post.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="success" style={{ marginBottom: 12 }}>
            {message}
          </div>
        )}

        <div className="grid two">
          {/* Post form */}
          <div className="card">
            <h2>Post Details</h2>

            <form className="form">
              {/* Location */}
              <div className="field">
                <label htmlFor="locationId">
                  Business Location *
                </label>

                <select
                  id="locationId"
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  disabled={loadingLocations}
                >
                  <option value="">
                    {loadingLocations
                      ? "Loading locations..."
                      : "Select location"}
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location._id}
                      value={location._id}
                    >
                      {location.businessName} - {location.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div className="field">
                <label htmlFor="topic">
                  Post Topic *
                </label>

                <input
                  id="topic"
                  name="topic"
                  type="text"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Free dental checkup camp this weekend"
                />
              </div>

              {/* Post type and tone */}
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="postType">
                    Post Type
                  </label>

                  <select
                    id="postType"
                    name="postType"
                    value={form.postType}
                    onChange={handleChange}
                  >
                    <option value="Update">Update</option>
                    <option value="Event">Event</option>
                    <option value="Offer">Offer</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="tone">
                    Tone
                  </label>

                  <select
                    id="tone"
                    name="tone"
                    value={form.tone}
                    onChange={handleChange}
                  >
                    <option value="Professional">
                      Professional
                    </option>
                    <option value="Friendly">
                      Friendly
                    </option>
                    <option value="Promotional">
                      Promotional
                    </option>
                    <option value="Warm">
                      Warm
                    </option>
                  </select>
                </div>
              </div>

              {/* Language and CTA */}
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="language">
                    Language
                  </label>

                  <select
                    id="language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="cta">
                    CTA
                  </label>

                  <select
                    id="cta"
                    name="cta"
                    value={form.cta}
                    onChange={handleChange}
                  >
                    <option value="Book">Book</option>
                    <option value="Call">Call</option>
                    <option value="Learn More">
                      Learn More
                    </option>
                    <option value="Order">Order</option>
                    <option value="Sign Up">Sign Up</option>
                    <option value="Get Offer">
                      Get Offer
                    </option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              {/* AI button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={generateContent}
                disabled={loadingAI}
              >
                {loadingAI
                  ? "Generating with AI..."
                  : "Generate with AI"}
              </button>

              {/* Content */}
              <div className="field">
                <label htmlFor="content">
                  Post Content *
                </label>

                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="AI-generated content will appear here. You can edit it."
                />
              </div>

              {/* Actions */}
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => savePost("draft")}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  disabled={saving}
                  onClick={() => savePost("published")}
                >
                  {saving ? "Saving..." : "Publish"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="card">
            <h2>Post Preview</h2>

            {!selectedLocation && (
              <div className="error">
                Please select a business location.
              </div>
            )}

            {selectedLocation && (
              <div className="preview">
                <div className="preview-top">
                  <strong>
                    {selectedLocation.businessName}
                  </strong>

                  <div className="small muted">
                    {selectedLocation.address}
                  </div>

                  <div className="small muted">
                    {selectedLocation.city} · {form.postType}
                  </div>
                </div>

                <div className="preview-content">
                  {form.content
                    ? form.content
                    : "Your post content preview will appear here."}
                </div>

                {form.cta !== "None" && (
                  <div className="cta">
                    {form.cta}
                  </div>
                )}
              </div>
            )}

            <p
              className="small muted"
              style={{ marginTop: 14 }}
            >
              Review the business name, location, content and
              CTA before saving or publishing.
            </p>

            {showPreview && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 10 }}
                onClick={() => setShowPreview(false)}
              >
                Back to Edit
              </button>
            )}
          </div>
        </div>
      </main>
    </Protected>
  );
}
