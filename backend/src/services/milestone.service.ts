import { milestoneRepository, MilestoneRecord } from "../db/repositories/milestone.repository";
import { ApiError } from "../utils/api-error.util";

function toPublicMilestone(milestone: MilestoneRecord) {
  return {
    id: milestone.id,
    category: milestone.category,
    title: milestone.title,
    description: milestone.description,
    occurredAt: milestone.occurred_at,
    createdAt: milestone.created_at,
  };
}

export const milestoneService = {
  create(userId: string, input: Parameters<typeof milestoneRepository.create>[1]) {
    const milestone = milestoneRepository.create(userId, input);
    return toPublicMilestone(milestone);
  },

  list(userId: string) {
    return milestoneRepository.listForUser(userId).map(toPublicMilestone);
  },

  delete(userId: string, milestoneId: string) {
    const existing = milestoneRepository.findByIdForUser(milestoneId, userId);
    if (!existing) {
      throw ApiError.notFound("Milestone not found");
    }
    milestoneRepository.delete(milestoneId, userId);
  },
};
