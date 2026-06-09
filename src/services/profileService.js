import { profiles } from "../data/profiles";

export function calculateProfile(competencies) {
  let bestProfile = null;
  let highestScore = -1;

  profiles.forEach((profile) => {
    const profileScores = profile.competencies.map((competencyId) => {
      const competency = competencies.find(
        (item) => item.id === competencyId
      );

      return competency?.score || 0;
    });

    const average =
      profileScores.reduce((sum, score) => sum + score, 0) /
      profileScores.length;

    if (average > highestScore) {
      highestScore = average;
      bestProfile = {
        ...profile,
        score: Math.round(average),
      };
    }
  });

  return bestProfile;
}