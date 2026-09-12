import { pseudoRandomFrom } from '../../brain/constellation/pseudoRandom';
import { swarmColourFor } from './hivePalette';
import type { HiveMember } from '$lib/data/hiveTypes';

const FULL_TURN_RADIANS = Math.PI * 2;
const NEAREST_ORBIT_RADIUS = 4.8;
const ORBIT_RADIUS_SPREAD = 3;
const STEEPEST_TILT_RADIANS = 0.55;
const SLOWEST_ORBIT_SPEED = 0.05;
const ORBIT_SPEED_SPREAD = 0.07;
const SMALLEST_SWARM = 36;
const PARTICLES_PER_CONSULTATION = 5;
const LARGEST_SWARM = 96;
const SMALLEST_BUZZ_RADIUS = 0.8;
const BUZZ_RADIUS_SPREAD = 0.5;
const SLOWEST_PULSE_SPEED = 0.22;
const PULSE_SPEED_PER_CONSULTATION = 0.015;
const FASTEST_PULSE_SPEED = 0.65;

export type HiveSwarm = {
	member: HiveMember;
	colour: number;
	orbitRadius: number;
	orbitTiltRadians: number;
	orbitPhaseRadians: number;
	orbitSpeedRadiansPerSecond: number;
	particleCount: number;
	buzzRadius: number;
	pulseSpeed: number;
};

export function buildHiveSwarms(members: HiveMember[]): HiveSwarm[] {
	return members.map((member, memberIndex) => swarmFor(member, memberIndex, members.length));
}

function swarmFor(member: HiveMember, memberIndex: number, memberCount: number): HiveSwarm {
	const drift = pseudoRandomFrom(member.handle);
	const spread = pseudoRandomFrom(`${member.handle}:orbit`);
	const buzz = clampedBuzz(member.questionCount);
	return {
		member,
		colour: swarmColourFor(memberIndex),
		orbitRadius: NEAREST_ORBIT_RADIUS + spread * ORBIT_RADIUS_SPREAD,
		orbitTiltRadians: (drift * 2 - 1) * STEEPEST_TILT_RADIANS,
		orbitPhaseRadians: (memberIndex / Math.max(1, memberCount)) * FULL_TURN_RADIANS + drift,
		orbitSpeedRadiansPerSecond: SLOWEST_ORBIT_SPEED + spread * ORBIT_SPEED_SPREAD,
		particleCount: buzz.particleCount,
		buzzRadius: buzz.radius,
		pulseSpeed: pulseSpeedFor(member.questionCount)
	};
}

function clampedBuzz(questionCount: number): { particleCount: number; radius: number } {
	const particleCount = Math.min(
		LARGEST_SWARM,
		SMALLEST_SWARM + questionCount * PARTICLES_PER_CONSULTATION
	);
	const growth = (particleCount - SMALLEST_SWARM) / (LARGEST_SWARM - SMALLEST_SWARM);
	return { particleCount, radius: SMALLEST_BUZZ_RADIUS + growth * BUZZ_RADIUS_SPREAD };
}

function pulseSpeedFor(questionCount: number): number {
	return Math.min(
		FASTEST_PULSE_SPEED,
		SLOWEST_PULSE_SPEED + questionCount * PULSE_SPEED_PER_CONSULTATION
	);
}
