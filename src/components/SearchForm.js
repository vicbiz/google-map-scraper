"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function SearchForm({ onSearch }) {
  const { register, handleSubmit } = useForm()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    if (!data.industry || !data.location) {
      toast({
        title: "Error",
        description: "Both fields are required!",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    await onSearch(data)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        placeholder="Business Industry (e.g., bakery, hospital, Korean restaurant)"
        {...register("industry")}
      />
      <Input placeholder="City, State or ZIP Code" {...register("location")} />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
