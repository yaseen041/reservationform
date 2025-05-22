"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { Input } from "../Common/FormComponents/Input"
import { Button } from "../Common/FormComponents/Button"
import type { PlacePrediction } from "@/Types"
const emptyPlace = {
  place: "23",
  placeId: "234",
  text: {
    text: "",
    matches: [
      {
        endOffset: 10,
      },
    ],
  },
  structuredFormat: {
    mainText: {
      text: "",
      matches: [
        {
          endOffset: 10,
        },
      ],
    },
    secondaryText: {
      text: "",
    },
  },
  types: [""],
}

interface PlaceSuggestion {
  placePrediction: PlacePrediction
}

interface PlacesAutocompleteProps {
  onChange: (placePrediction: PlacePrediction) => void
  value: string
  states: string[]
}

export const PlacesAutocomplete = ({ onChange, value, states }: PlacesAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_PLACES_API ?? "",
        },
        body: JSON.stringify({
          input: query,
          // Add region biasing for US
          locationBias: {
            rectangle: {
              low: { latitude: 24.396308, longitude: -125.0 }, // Southwest US
              high: { latitude: 49.384358, longitude: -66.93457 }, // Northeast US
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch places")
      }

      const data = await response.json()

      // Filter suggestions to only include addresses from the specified states
      const filteredSuggestions = data.suggestions
        ? data.suggestions.filter((suggestion: { placePrediction: PlacePrediction }) => {
            const secondaryText = suggestion.placePrediction.structuredFormat?.secondaryText?.text || ""

            // Check if the address contains any of the states in the states array
            return states.some((state) => {
              // Check for state code at the end of the address or followed by a zip code
              const stateRegex = new RegExp(`\\b${state}\\b`, "i")
              return stateRegex.test(secondaryText)
            })
          })
        : []

      setSuggestions(filteredSuggestions)
    } catch (error) {
      console.error("Error fetching places:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce the input to prevent too many API calls
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      searchPlaces(inputValue)
    }, 300) // 300ms debounce time

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputValue])

  // Handle clicks outside to close the suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value) {
      setShowSuggestions(true)
    } else {
      onChange(emptyPlace)
      setSuggestions([])
    }
  }

  const handleSelectPlace = (place: PlacePrediction) => {
    onChange(place)
    setInputValue(place?.structuredFormat?.mainText?.text || place?.text?.text)
    setShowSuggestions(false)
  }

  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Update suggestions when states array changes
  useEffect(() => {
    if (inputValue) {
      searchPlaces(inputValue)
    }
  }, [states])

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Input
          ref={inputRef}
          placeholder="Search for a location..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full pr-10"
          onFocus={() => {
            if (inputValue) setShowSuggestions(true)
          }}
          onClick={() => {
            if (inputValue) setShowSuggestions(true)
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
            if (inputValue) setShowSuggestions(true)
          }}
          type="button"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Custom dropdown for suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-md"
        >
          <div className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            )}

            {!loading && (!suggestions || suggestions.length === 0) && (
              <div className="py-6 text-center text-sm text-gray-500">No places found.</div>
            )}

            {!loading && suggestions && suggestions.length > 0 && (
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.placePrediction.placeId}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                    onClick={() => handleSelectPlace(suggestion.placePrediction)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {suggestion.placePrediction.structuredFormat?.mainText.text ||
                            suggestion.placePrediction.text.text}
                        </span>
                        {suggestion.placePrediction.structuredFormat?.secondaryText && (
                          <span className="text-sm text-gray-500">
                            {suggestion.placePrediction.structuredFormat.secondaryText.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* {selectedPlace && (
        <div className="mt-4 rounded-md border bg-gray-50 p-4">
          <h3 className="font-medium">Selected Place:</h3>
          <p className="mt-1">
            {selectedPlace.structuredFormat?.mainText.text ||
              selectedPlace.text.text}
          </p>
          {selectedPlace.structuredFormat?.secondaryText && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedPlace.structuredFormat.secondaryText.text}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <p>Place ID: {selectedPlace.placeId}</p>
            {selectedPlace.types && (
              <p className="mt-1">Types: {selectedPlace.types.join(", ")}</p>
            )}
          </div>
        </div>
      )} */}
    </div>
  )
}

