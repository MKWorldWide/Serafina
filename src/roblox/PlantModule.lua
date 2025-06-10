--[[
    PlantModule.lua
    Manages plant types, emotion tags, and growth stages for NeuroBloom
    Author: GameDin
    Version: 1.0.0
]]

local PlantModule = {}

-- Constants
local GROWTH_STAGES = {
    SEED = 1,
    SPROUT = 2,
    BUDDING = 3,
    BLOOMING = 4,
    MATURE = 5
}

local EMOTION_TAGS = {
    JOY = "joy",
    PEACE = "peace",
    HOPE = "hope",
    LOVE = "love",
    GRATITUDE = "gratitude",
    WONDER = "wonder",
    COURAGE = "courage",
    ACCEPTANCE = "acceptance"
}

-- Plant Types Configuration
local PLANT_TYPES = {
    {
        name = "Luminous Lily",
        emotionTag = EMOTION_TAGS.JOY,
        growthTime = 300, -- seconds
        stages = {
            [GROWTH_STAGES.SEED] = {
                model = "rbxassetid://SEED_MODEL_ID",
                glowIntensity = 0.2,
                scale = Vector3.new(0.5, 0.5, 0.5)
            },
            [GROWTH_STAGES.SPROUT] = {
                model = "rbxassetid://SPROUT_MODEL_ID",
                glowIntensity = 0.4,
                scale = Vector3.new(0.7, 0.7, 0.7)
            },
            [GROWTH_STAGES.BUDDING] = {
                model = "rbxassetid://BUDDING_MODEL_ID",
                glowIntensity = 0.6,
                scale = Vector3.new(0.9, 0.9, 0.9)
            },
            [GROWTH_STAGES.BLOOMING] = {
                model = "rbxassetid://BLOOMING_MODEL_ID",
                glowIntensity = 0.8,
                scale = Vector3.new(1.1, 1.1, 1.1)
            },
            [GROWTH_STAGES.MATURE] = {
                model = "rbxassetid://MATURE_MODEL_ID",
                glowIntensity = 1.0,
                scale = Vector3.new(1.3, 1.3, 1.3)
            }
        }
    },
    {
        name = "Serene Sage",
        emotionTag = EMOTION_TAGS.PEACE,
        growthTime = 360,
        stages = {
            -- Similar structure to Luminous Lily
        }
    },
    -- Add more plant types here
}

-- Plant Class
local Plant = {}
Plant.__index = Plant

function Plant.new(plantType, position)
    local self = setmetatable({}, Plant)
    self.plantType = plantType
    self.position = position
    self.currentStage = GROWTH_STAGES.SEED
    self.growthProgress = 0
    self.lastWatered = os.time()
    self.emotionEnergy = 0
    return self
end

function Plant:update(deltaTime)
    -- Update growth progress
    self.growthProgress = self.growthProgress + (deltaTime / self.plantType.growthTime)
    
    -- Check for stage advancement
    if self.growthProgress >= 1 then
        self:advanceStage()
    end
    
    -- Update glow effect
    self:updateGlow()
end

function Plant:advanceStage()
    if self.currentStage < GROWTH_STAGES.MATURE then
        self.currentStage = self.currentStage + 1
        self.growthProgress = 0
        self:updateModel()
    end
end

function Plant:updateModel()
    local stageData = self.plantType.stages[self.currentStage]
    -- Update model, glow, and scale based on stageData
end

function Plant:updateGlow()
    local stageData = self.plantType.stages[self.currentStage]
    local baseGlow = stageData.glowIntensity
    local emotionMultiplier = 1 + (self.emotionEnergy * 0.5)
    -- Apply glow effect with emotion influence
end

function Plant:applyEmotion(emotionValue)
    self.emotionEnergy = math.clamp(self.emotionEnergy + emotionValue, 0, 1)
end

-- Module Functions
function PlantModule.createPlant(plantTypeName, position)
    local plantType = PlantModule.getPlantType(plantTypeName)
    if plantType then
        return Plant.new(plantType, position)
    end
    return nil
end

function PlantModule.getPlantType(plantTypeName)
    for _, plantType in ipairs(PLANT_TYPES) do
        if plantType.name == plantTypeName then
            return plantType
        end
    end
    return nil
end

function PlantModule.getEmotionTags()
    return EMOTION_TAGS
end

function PlantModule.getGrowthStages()
    return GROWTH_STAGES
end

return PlantModule 