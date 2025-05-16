"use client"

import { useState, useEffect, useRef } from "react"
import "./PowerBIDashboard.css"

interface PowerBIDashboardProps {
  reportId: string
  embedUrl?: string
  ctid: string
  height?: number
}

const PowerBIDashboard = ({
  reportId,
  embedUrl = "https://app.powerbi.com/reportEmbed",
  ctid,
  height = 600,
}: PowerBIDashboardProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fullEmbedUrl = `${embedUrl}?reportId=${reportId}&autoAuth=true&ctid=${ctid}`

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError(true)
  }

  const retryLoading = () => {
    setLoading(true)
    setError(false)
    if (iframeRef.current) {
      iframeRef.current.src = fullEmbedUrl
    }
  }

  // Check if iframe is actually loaded
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError(true)
      }
    }, 30000) // 30 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [loading])

  return (
    <div className="powerbi-container" style={{ height: `${height}px` }}>
      {loading && (
        <div className="powerbi-loading">
          <div className="powerbi-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="powerbi-error">
          <p>There was an error loading the dashboard. Please try again later.</p>
          <button onClick={retryLoading} className="powerbi-retry-button">
            Retry
          </button>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Power BI Dashboard"
        width="100%"
        height={height}
        src={fullEmbedUrl}
        frameBorder="0"
        allowFullScreen={true}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ display: loading || error ? "none" : "block" }}
      ></iframe>
    </div>
  )
}

export default PowerBIDashboard
