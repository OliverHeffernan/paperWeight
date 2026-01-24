import OpenAI from "npm:openai@4.24.1";
import OpenAIImgURLFormat from "./openAIImgURLFormat.ts";
export default async function executePrompt(imgs: OpenAIImgURLFormat[]): Promise<any> {
	const response = await openai.chat.completions.create({
		//model: "gpt-4.1-mini",
		model: "gpt-5-mini",
		response_format: {
			type: "json_schema",
			json_schema: {
				"name": "workoutSchema",
				"strict": true,
				"schema": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"exercises_full": {
							"type": "array",
							"items": {
								"type": "object",
								"additionalProperties": false,
								"properties": {
									"exercise": {
										"type": "string"
									},
									"sets": {
										"type": "array",
										"description": "Sets will usually be denoted as either weight×reps. Or reps×weight. If there is a cross symbol in the middle of the set, this does not mean that the set was failed, assume that the cross symbol is the multplication symbol. If a set is written, assume that it was completed, unless it is crossed out, specifcally stated that it was failed. If there is a \"...\" below a set, it means that there is another set, the same as the previous. If the weight is left blank, but a number of reps is provided, assume that the weight is the same as the previous set. If no weight is provided for the first set, assume that the weight is 0. If there is a note next to a set, include it in the notes field. If there is a rest time provided between sets, include it in the rest field. If no rest time is provided, leave the rest field as null. If there are two sets written explicitly in a row, this means that the set was completed twice, so include both sets separately. The order of the sets is important, so keep it the same as in the image. If you are unsure of any number, make your best guess based on context, including previous sets of the same exercise.",
										"items": {
											"type": "object",
											"additionalProperties": false,
											"properties": {
												"reps": {
													"type": "integer",
													"description": "number of repetitions. If you think it says 0 reps, assume it says 10 reps."
												},
												"weight": {
													"type": "number",
													"description": "weight used for the set"
												},
												"unit": {
													"type": "string",
													"description": "unit of the weight, e.g., kg, lbs, if not specified, say 'not specified'"
												},
												"rest": {
													"type": "integer",
													"nullable": true,
													"description": "rest time in seconds. If not specified leave as null"
												},
												"notes": {
													"type": "string",
													"description": "additional notes for the set. Leave as empty string if no notes are provided"
												}
											},
											"required": [ "reps", "weight", "notes", "rest", "unit" ]
										}
									}
								},
								"required": [ "exercise", "sets", ]
							}
						},
						"startTime": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"day": {
									"type": "integer",
									"description": "The day of the month"
								},
								"month": {
									"type": "integer",
									"description": "The numerical value of the month, e.g. january is 1, february is 2 etc."
								},
								"hour": {
									"type": "integer",
									"description": "Hour of the day in 24 hour time"
								},
								"minute": {
									"type": "integer",
									"description": "Minute in the hour"
								},
								"year": {
									"type": "integer",
									"description": "the year that the workout started in. If not provided, do not provide this field."
								}
							},
							"required": [ "day", "month", "hour", "minute", "year" ],
							"description": "The start date and time of the workout. If this cannot be found in the image, this field can be left blank. Unless it is clear that they are using a different date format, assume that the format is either DD/MM/YY or DD/MM/YYYY"
						},
						"endTime": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"day": {
									"type": "integer",
									"nullable": true,
									"description": "The day of the month"
								},
								"month": {
									"type": "integer",
									"nullable": true,
									"description": "The numerical value of the month, e.g. january is 1, february is 2 etc."
								},
								"hour": {
									"type": "integer",
									"nullable": true,
									"description": "Hour of the day in 24 hour time"
								},
								"minute": {
									"type": "integer",
									"nullable": true,
									"description": "Minute in the hour"
								},
								"year": {
									"type": "integer",
									"nullable": true,
									"description": "the year that the workout was completed in. If not provided, assume the same year as the start time."
								}
							},
							"required": [ "day", "month", "hour", "minute", "year" ],
							"description": "The end date and time of the workout. If this cannot be found in the image, this field can be left blank. If the start time is specified, but the end time is not, then please make an estimate based on how long each exercise in the workout would take. Unless it is clear that they are using a different date format, assume that the format is either DD/MM/YY or DD/MM/YYYY. Please use some logic when choosing this value, like if you think it says something, but then it is actually less than the start time, or a long time after the start time, it is probably wrong."
						},
						"title": {
							"type": "string",
							"description": "If no title can be found, default to something of the format `${timeOfWorkout} ${workoutType}`, where the workoutType can be things like push, pull, legs, upper, plyo, full body; and timeOfWorkout can be things like early morning, morning, lunch, afternoon, evening, dinner, night, midnight."
						},
						"notes": {
							"type": "string",
							"description": "additional notes for the workout. Leave as empty string if no notes are provided."
						},
						"energy": {
							"type": "object",
							"additionalProperties": false,
							"nullable": true,
							"description": "The energy burned in the workout, either in kilojoules or calories. If not specified, leave as null.",
							"properties": {
								"amount": {
									"type": "number"
								},
								"unit": {
									"type": "string",
									"description": "either kj or kcal"
								}
							},
							"required": [ "amount", "unit" ],
						},
						"heart_rate": {
							"type": [
								"number",
								"null"
							],
							"description": "The average heart rate in the workout. If not specified, please make null. It may be stated as a number, followed by 'bpm'. Might not be explicitly stated as heart rate, but it is safe to assume if it says bpm, then it is heart rate."
						}
					},
					"required": [ "title", "exercises_full", "startTime", "endTime", "notes", "energy", "heart_rate"],
				},
			}
		},
		messages: [
			{
				role: "system",
				content: `You are an expert at reading handwritten workout logs. You must follow the JSON schema very strictly. Carefully interpret ambiguous handwriting using context from nearby numbers/sets. "DB" = Dumbbell, "BB" = Barbell, "×" or "x" = multiplication, crossed out = not completed. If unsure about a digit, choose the most likely value based on pattern. Output ONLY valid JSON matching the schema.`
			},
			{
				role: "user",
				content: imgs
			}
		],
		max_completion_tokens: 4096,
	});
	return response;
}
