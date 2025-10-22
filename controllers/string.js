import crypto from "crypto"
import stringModel from "../models/String.js"

const readAllStringsWithFiltering = async (req, res) => {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query

    // Validate for correct values/types on query strings
    // if true then invalid types, if false then valid types,
    // so move to build filter
    if (
      (is_palindrome &&
        is_palindrome !== "true" &&
        is_palindrome !== "false") ||
      (min_length && isNaN(Number(min_length))) ||
      (max_length && isNaN(Number(max_length))) ||
      (word_count && isNaN(Number(word_count))) ||
      (contains_character && contains_character.length !== 1)
    ) {
      return res.status(400).json({
        message: "Invalid query parameter values or types",
      })
    }

    // Build filter(the condition mongoose must satisfy)
    const filters_applied = {}

    if (is_palindrome === "true" || is_palindrome === "false") {
      filters_applied["properties.is_palindrome"] = is_palindrome === "true"
    }

    if (min_length) {
      filters_applied["properties.length"] = {
        ...filters_applied["properties.length"],
        $gte: Number(min_length),
      }
    }

    if (max_length) {
      filters_applied["properties.length"] = {
        ...filters_applied["properties.length"],
        $lte: Number(max_length),
      }
    }

    if (word_count) {
      filters_applied["properties.word_count"] = Number(word_count)
    }

    if (contains_character) {
      filters_applied["value"] = { $regex: contains_character }
    }

    const findString = await stringModel.find(filters_applied)

    res.status(200).json({
      data: findString.map((object) => {
        return {
          id: object.id,
          value: object.value,
          properties: object.properties,
          created_at: object.created_at,
        }
      }),
      count: findString.length,
      filters_applied: req.query,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const readStringsFilteredByNaturalLanguage = async (req, res) => {
  try {
    const { query } = req.query

    // Build parsed filter(the condition mongoose must satisfy)
    const parsed_filters = {}

    if (query === "all single word palindromic strings") {
      parsed_filters["properties.word_count"] = 1
      parsed_filters["properties.is_palindrome"] = true
    } else if (query === "strings longer than 10 characters") {
      parsed_filters["properties.length"] = { $gte: 11 }
    } else if (query === "palindromic strings that contain the first vowel") {
      parsed_filters["value"] = { $regex: "a" }
      parsed_filters["properties.is_palindrome"] = true
    } else if (query === "strings containing the letter z") {
      parsed_filters["value"] = { $regex: "z" }
    } else {
      return res.status(400).json({
        message: "Unable to parse natural language query",
      })
    }

    if (
      (parsed_filters["properties.is_palindrome"] === true &&
        parsed_filters["properties.is_palindrome"] === false) ||
      (parsed_filters["properties.word_count"] === 1 &&
        parsed_filters["properties.length"]?.$gte > 50) //check $gte if filters['properties.length'] exists.
    ) {
      return res.status(422).json({
        message: "Query parsed but resulted in conflicting filters",
      })
    }

    const interpreted_query = {
      original: query,
      parsed_filters: {},
    }

    for (const key in parsed_filters) {
      // remove "properties." prefix if it exists
      const cleanKey = key.replace(/^properties\./, "")
      // copy value from the original filter object(parsed_filters)
      // and assign it to the new key .
      interpreted_query.parsed_filters[cleanKey] = parsed_filters[key]
    }

    const findString = await stringModel.find(parsed_filters)

    res.status(200).json({
      data: findString.map((object) => {
        return {
          id: object.id,
          value: object.value,
          properties: object.properties,
          created_at: object.created_at,
        }
      }),
      count: findString.length,
      interpreted_query,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const readSpecificString = async (req, res) => {
  try {
    const { string_value } = req.params

    const findString = await stringModel.findOne({ value: string_value })
    if (!findString) {
      return res.status(404).json({
        message: "String does not exist in the system",
      })
    }

    res.status(200).json({
      id: findString.id,
      value: findString.value,
      properties: findString.properties,
      created_at: findString.created_at,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const createAndAnalyzeString = async (req, res) => {
  try {
    const { value } = req.body

    if (!value) {
      return res.status(400).json({
        message: "Invalid request body or missing 'value' field",
      })
    }

    if (typeof value !== "string") {
      return res.status(422).json({
        message: "Invalid data type for 'value', must be string",
      })
    }

    const findString = await stringModel.findOne({ value })
    if (findString) {
      return res.status(409).json({
        message: "String already exists in the system",
      })
    }

    const sha256HashOfString = crypto
      .createHash("sha256")
      .update(value)
      .digest("hex")

    const stringLength = value.length

    // palindrome is a word whose normal and reversed state read the same
    const checkIfPalindrome = (string) => {
      // replace anything that is not a lowercae letter/number with nothing
      // ie. remove it
      const normalizedStringState = string
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
      const reversedStringState = normalizedStringState
        .split("")
        .reverse()
        .join("")

      if (normalizedStringState === reversedStringState) {
        return true
      } else {
        return false
      }
    }

    // unique characters are distint characters in a string,
    // ignoring how many times they are repeated
    const countUniqueCharacters = (string) => {
      const uniqueValues = new Set(string)
      const count = uniqueValues.size

      return count
    }

    const countWords = (string) => {
      const stringToArray = string.split(" ")
      const count = stringToArray.length

      return count
    }

    // how many times each character appears in a given string
    let char
    let charCount = {}
    let storedChar = " "
    const charFrequencyInString = (string) => {
      for (char = 0; char < string.length; char++) {
        storedChar = string[char]
        // if char exists,add to it
        if (charCount[storedChar]) {
          charCount[storedChar]++
        } else {
          charCount[storedChar] = 1 //else initialize it to 1
        }
      }

      return charCount
    }
    // function call returns object but character_frequency_map
    // expects a map, so convert returned charCount object from
    // the function call to typeof Map
    const returnedObject = charFrequencyInString(value)
    const returnedObjectConvertedToMap = new Map(Object.entries(returnedObject))

    const stringCreationDate = new Date().toISOString().split(".")[0] + "Z"

    const analyzedString = await stringModel.create({
      id: sha256HashOfString,
      value: value,
      properties: {
        length: stringLength,
        is_palindrome: checkIfPalindrome(value),
        unique_characters: countUniqueCharacters(value),
        word_count: countWords(value),
        sha256_hash: sha256HashOfString,
        character_frequency_map: returnedObjectConvertedToMap,
      },
      created_at: stringCreationDate,
    })

    res.status(201).json({
      id: analyzedString.id,
      value: analyzedString.value,
      properties: analyzedString.properties,
      created_at: analyzedString.created_at,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const deleteSpecificString = async (req, res) => {
  try {
    const { string_value } = req.params

    const findString = await stringModel.findOne({ value: string_value })
    if (!findString) {
      return res.status(404).json({
        message: "String does not exist in the system",
      })
    }

    await stringModel.findOneAndDelete({ value: string_value })
    res.status(204).json()
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

export {
  readAllStringsWithFiltering,
  readStringsFilteredByNaturalLanguage,
  readSpecificString,
  createAndAnalyzeString,
  deleteSpecificString,
}
