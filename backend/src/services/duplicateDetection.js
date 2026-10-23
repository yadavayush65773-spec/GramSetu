import { normalizeName } from '../utils/ids.js';

export function findPotentialDuplicates(targetBeneficiary, allBeneficiaries = [], allEvidence = []) {
  if (!targetBeneficiary) return [];

  const candidates = [];
  const targetNormName = normalizeName(targetBeneficiary.fullName || targetBeneficiary.full_name);
  const targetHousehold = targetBeneficiary.householdReference || targetBeneficiary.household_reference;
  const targetPhone = targetBeneficiary.phoneMasked || targetBeneficiary.phone_masked;
  const targetId = targetBeneficiary.id;

  for (const other of allBeneficiaries) {
    if (other.id === targetId) continue;

    const reasons = [];
    let score = 0;

    const otherNormName = normalizeName(other.fullName || other.full_name);
    const otherHousehold = other.householdReference || other.household_reference;
    const otherPhone = other.phoneMasked || other.phone_masked;

    // 1. Same normalized name within same district/block
    if (targetNormName && otherNormName && targetNormName === otherNormName) {
      const sameBlock = (other.block || other.block_id) === (targetBeneficiary.block || targetBeneficiary.block_id);
      score += sameBlock ? 45 : 30;
      reasons.push(sameBlock ? 'Exact name match in identical administrative block' : 'Exact name match in same district');
    } else if (
      targetNormName &&
      otherNormName &&
      (targetNormName.includes(otherNormName) || otherNormName.includes(targetNormName)) &&
      Math.abs(targetNormName.length - otherNormName.length) <= 5
    ) {
      score += 20;
      reasons.push('High phonetic & token similarity in applicant name');
    }

    // 2. Household reference match
    if (targetHousehold && otherHousehold && targetHousehold === otherHousehold) {
      score += 40;
      reasons.push(`Duplicate household reference (${targetHousehold}) enrolled under scheme`);
    }

    // 3. Masked phone match in same village
    if (targetPhone && otherPhone && targetPhone === otherPhone) {
      const sameVillage = (other.village || other.village_id) === (targetBeneficiary.village || targetBeneficiary.village_id);
      if (sameVillage) {
        score += 25;
        reasons.push('Matching registered phone number in same village');
      }
    }

    if (score >= 30) {
      candidates.push({
        candidateId: other.id,
        candidateCode: other.beneficiaryCode || other.beneficiary_reference,
        candidateName: other.fullName || other.full_name,
        village: other.village || other.village_id,
        block: other.block || other.block_id,
        district: other.district || other.district_id,
        matchScore: Math.min(100, score),
        reasons,
        verificationStatus: other.verificationStatus || other.verification_status,
      });
    }
  }

  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}
