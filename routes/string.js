import { Router } from "express"
import {
  readAllStringsWithFiltering,
  readStringsFilteredByNaturalLanguage,
  readSpecificString,
  createAndAnalyzeString,
  deleteSpecificString,
} from "../controllers/string.js"

const router = Router()

router.get("/", readAllStringsWithFiltering)

router.get("/filter-by-natural-language", readStringsFilteredByNaturalLanguage)

router.get("/:string_value", readSpecificString)

router.post("/", createAndAnalyzeString)

router.delete("/:string_value", deleteSpecificString)

export default router
