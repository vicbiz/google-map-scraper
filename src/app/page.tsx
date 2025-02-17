"use client"

import { useState } from "react"
import SearchForm from "@/components/SearchForm"
import BusinessList from "@/components/BusinessList"
import { toast } from "@/hooks/use-toast"

export default function Home() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBusinessData = async (searchData) => {
    setLoading(true)
    setBusinesses([])

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData),
      })

      const data = await res.json()
      if (res.ok) {
        console.log("data ::::", data)
        setBusinesses(data.businesses)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Google Maps Business Scraper</h1>
      <SearchForm onSearch={fetchBusinessData} />
      {loading ? (
        <p className="text-center mt-4">Fetching results...</p>
      ) : (
        <BusinessList businesses={businesses} />
      )}
    </main>
  )
}
