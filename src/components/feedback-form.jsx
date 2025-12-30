import React, { useState } from "react"

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjqrjqo"

const styles = {
  container: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-accent)",
    borderRadius: "var(--radius-md)",
    padding: "var(--spacing-6)",
    marginTop: "var(--spacing-8)",
    marginBottom: "var(--spacing-8)",
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "var(--fontSize-3)",
    fontWeight: "var(--fontWeight-bold)",
    color: "var(--color-heading)",
    marginTop: 0,
    marginBottom: "var(--spacing-2)",
  },
  subtitle: {
    color: "var(--color-text-light)",
    fontSize: "var(--fontSize-1)",
    marginBottom: "var(--spacing-6)",
  },
  fieldset: {
    border: "none",
    padding: 0,
    margin: 0,
    marginBottom: "var(--spacing-6)",
  },
  legend: {
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-bold)",
    color: "var(--color-heading)",
    marginBottom: "var(--spacing-3)",
    fontSize: "var(--fontSize-1)",
  },
  radioGroup: {
    display: "flex",
    gap: "var(--spacing-4)",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    cursor: "pointer",
    fontSize: "var(--fontSize-1)",
  },
  radioInput: {
    accentColor: "var(--color-primary)",
    width: "1rem",
    height: "1rem",
    cursor: "pointer",
  },
  ratingGroup: {
    display: "flex",
    gap: "var(--spacing-2)",
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-3)",
  },
  ratingLabel: {
    fontSize: "var(--fontSize-0)",
    color: "var(--color-text-light)",
    whiteSpace: "nowrap",
  },
  ratingButton: {
    width: "2.5rem",
    height: "2.5rem",
    border: "1px solid var(--color-accent)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-soft)",
    cursor: "pointer",
    fontSize: "var(--fontSize-1)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-bold)",
    color: "var(--color-text)",
    transition: "all 0.2s ease",
  },
  ratingButtonSelected: {
    background: "var(--color-primary)",
    color: "var(--color-surface)",
    borderColor: "var(--color-primary)",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "var(--spacing-3)",
    border: "1px solid var(--color-accent)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-soft)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontSize-1)",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    padding: "var(--spacing-3) var(--spacing-6)",
    background: "var(--color-primary)",
    color: "var(--color-surface)",
    border: "none",
    borderRadius: "var(--radius-pill)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-bold)",
    fontSize: "var(--fontSize-1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-md)",
    textAlign: "center",
  },
  errorMessage: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-md)",
    marginBottom: "var(--spacing-4)",
  },
  collapsedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    padding: "var(--spacing-4) var(--spacing-6)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-accent)",
    borderRadius: "var(--radius-md)",
    marginTop: "var(--spacing-8)",
    marginBottom: "var(--spacing-8)",
    transition: "background 0.2s ease",
  },
  collapsedText: {
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontSize-1)",
    color: "var(--color-text)",
    margin: 0,
  },
  chevron: {
    fontSize: "var(--fontSize-2)",
    color: "var(--color-text-light)",
    transition: "transform 0.2s ease",
  },
  chevronExpanded: {
    transform: "rotate(180deg)",
  },
}

const FeedbackForm = ({ postTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [understandingBefore, setUnderstandingBefore] = useState(null)
  const [understandingAfter, setUnderstandingAfter] = useState(null)
  const [unclear, setUnclear] = useState("")
  const [feedback, setFeedback] = useState("")
  const [status, setStatus] = useState("idle") // idle, submitting, success, error

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus("submitting")

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postTitle,
          understandingBefore,
          understandingAfter,
          unclear,
          feedback,
        }),
      })

      if (response.ok) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div style={styles.container}>
        <div style={styles.successMessage}>Thank you for your feedback!</div>
      </div>
    )
  }

  const isSubmitting = status === "submitting"

  if (!isExpanded) {
    return (
      <div
        style={styles.collapsedHeader}
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            setIsExpanded(true)
          }
        }}
      >
        <p style={styles.collapsedText}>
          To help me get better at writing, please consider filling out this
          feedback form.
        </p>
        <span style={styles.chevron}>▼</span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--spacing-4)",
        }}
      >
        <div>
          <p style={{ ...styles.collapsedText }}>
            To help me get better at writing, please consider filling out this
            feedback form.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--spacing-2)",
            color: "var(--color-text-light)",
            fontSize: "var(--fontSize-2)",
          }}
          aria-label="Collapse form"
        >
          ▲
        </button>
      </div>

      {status === "error" && (
        <div style={styles.errorMessage}>
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="postTitle" value={postTitle} />

        {/* Understanding Before */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            Please rate your understanding of the PD-1 pathway and Keytruda
            before reading the post.
          </legend>
          <div style={styles.ratingContainer}>
            <span style={styles.ratingLabel}>None</span>
            <div style={styles.ratingGroup}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setUnderstandingBefore(num)}
                  style={{
                    ...styles.ratingButton,
                    ...(understandingBefore === num
                      ? styles.ratingButtonSelected
                      : {}),
                  }}
                  aria-label={`Rate ${num} out of 5`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span style={styles.ratingLabel}>Expert</span>
          </div>
        </fieldset>

        {/* Understanding After */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            Please rate your understanding of the PD-1 pathway and Keytruda
            after reading the post.
          </legend>
          <div style={styles.ratingContainer}>
            <span style={styles.ratingLabel}>None</span>
            <div style={styles.ratingGroup}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setUnderstandingAfter(num)}
                  style={{
                    ...styles.ratingButton,
                    ...(understandingAfter === num
                      ? styles.ratingButtonSelected
                      : {}),
                  }}
                  aria-label={`Rate ${num} out of 5`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span style={styles.ratingLabel}>Expert</span>
          </div>
        </fieldset>

        {/* What was unclear */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>What was unclear or confusing?</legend>
          <textarea
            name="unclear"
            value={unclear}
            onChange={e => setUnclear(e.target.value)}
            style={styles.textarea}
            placeholder="Anything that could be explained better..."
          />
        </fieldset>

        {/* General Feedback */}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Any other feedback?</legend>
          <textarea
            name="feedback"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            style={styles.textarea}
            placeholder="Suggestions, corrections, or comments..."
          />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
        >
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  )
}

export default FeedbackForm
