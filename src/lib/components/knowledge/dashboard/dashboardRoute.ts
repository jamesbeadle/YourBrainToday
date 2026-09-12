const dashboardRoutePrefix = '/knowledge-base/[knowledgeBaseId=uuid]';
const newBrainRouteSuffix = '/brains/new';

/** The constellation and brain routes fill the viewport; the new-brain form is an ordinary page. */
export function isKnowledgeBaseDashboardRoute(routeId: string | null): boolean {
	if (routeId === null) return false;
	return routeId.startsWith(dashboardRoutePrefix) && !routeId.endsWith(newBrainRouteSuffix);
}
