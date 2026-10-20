var e=[{topic:`Reliability`,blurb:`Where the on-call pages are landing right now.`,queries:[{label:`Top services by incident count`,description:`Which services have eaten the most pages over the catalog window.`,sql:`SELECT
  serviceName,
  COUNT(*) AS incidents,
  SUM(durationMinutes) AS total_down_min,
  ROUND(AVG(durationMinutes), 0) AS avg_min
FROM incidents
GROUP BY serviceName
ORDER BY incidents DESC
LIMIT 20;`},{label:`Open high-sev incidents by team`,description:`Active sev1 + sev2 grouped by owning team: who needs help today.`,sql:`SELECT
  s.team,
  COUNT(*) AS open_high_sev
FROM incidents i
JOIN services s ON s.id = i.serviceId
WHERE i.status = 'open'
  AND i.severity IN ('sev1', 'sev2')
GROUP BY s.team
ORDER BY open_high_sev DESC;`},{label:`Tier-1 services with firing monitors`,description:`High-impact services that have an alerting monitor right now.`,sql:`SELECT DISTINCT
  s.name,
  s.team,
  COUNT(m.id) AS firing_monitors
FROM services s
JOIN monitors m ON m.serviceId = s.id
WHERE s.tier = 'tier1'
  AND m.status = 'alert'
GROUP BY s.name, s.team
ORDER BY firing_monitors DESC;`}]},{topic:`Cost`,blurb:`Dollar impact of operational pain: where to invest in resilience.`,queries:[{label:`Highest-cost incidents (top 20)`,description:`Estimated USD impact of recent incidents, biggest first.`,sql:`SELECT
  title,
  serviceName,
  severity,
  cost,
  durationMinutes
FROM incidents
WHERE cost > 0
ORDER BY cost DESC
LIMIT 20;`},{label:`Incident cost by team`,description:`Roll up estimated incident cost to the owning team.`,sql:`SELECT
  s.team,
  COUNT(i.id) AS incidents,
  SUM(i.cost) AS total_cost_usd,
  ROUND(AVG(i.cost), 0) AS avg_cost_usd
FROM services s
JOIN incidents i ON i.serviceId = s.id
WHERE i.cost > 0
GROUP BY s.team
ORDER BY total_cost_usd DESC
LIMIT 15;`},{label:`Customer-minutes by service`,description:`Aggregate customer minutes affected: the impact metric that matters most.`,sql:`SELECT
  serviceName,
  SUM(COALESCE(customerMinutesAffected, 0)) AS customer_min,
  COUNT(*) AS incidents
FROM incidents
GROUP BY serviceName
HAVING customer_min > 0
ORDER BY customer_min DESC
LIMIT 20;`}]},{topic:`Security`,blurb:`Compliance scope, posture, and tier-1 coverage gaps.`,queries:[{label:`Services in scope by framework`,description:`How many services carry each compliance tag: useful for audit evidence.`,sql:`SELECT
  scope AS framework,
  COUNT(*) AS services
FROM services, UNNEST(complianceScope) AS t(scope)
GROUP BY scope
ORDER BY services DESC;`},{label:`Tier-1 services missing SOC2 scope`,description:`High-impact services that aren't tagged as in SOC2 scope: likely gaps.`,sql:`SELECT
  name,
  team,
  ownerEmail,
  complianceScope
FROM services
WHERE tier = 'tier1'
  AND (complianceScope IS NULL OR NOT list_contains(complianceScope, 'SOC2'))
ORDER BY team, name;`}]},{topic:`Ownership`,blurb:`Who owns what, and where the owner field is empty.`,queries:[{label:`Services without an owner email`,description:`Catalog gaps: services with a blank or missing ownerEmail.`,sql:`SELECT
  name,
  team,
  tier,
  status
FROM services
WHERE ownerEmail IS NULL
   OR ownerEmail = ''
ORDER BY tier, name;`},{label:`Owners by load (service count)`,description:`Ranks owner emails by how many services they're on the hook for.`,sql:`SELECT
  ownerEmail,
  COUNT(*) AS services,
  COUNT(DISTINCT team) AS teams
FROM services
WHERE ownerEmail IS NOT NULL AND ownerEmail <> ''
GROUP BY ownerEmail
ORDER BY services DESC
LIMIT 20;`}]},{topic:`Drift`,blurb:`Catalog entries that look out of date relative to the rest of the fleet.`,queries:[{label:`Critical-path services without a tier`,description:`criticalPath = true but tier is unset: a classification gap.`,sql:`SELECT
  name,
  team,
  ownerEmail
FROM services
WHERE criticalPath = true
  AND (tier IS NULL OR tier = '')
ORDER BY team, name;`},{label:`Services with no monitors attached`,description:`Catalogued services that don't show up in the monitors table at all.`,sql:`SELECT
  s.name,
  s.team,
  s.tier
FROM services s
LEFT JOIN monitors m ON m.serviceId = s.id
WHERE m.id IS NULL
ORDER BY s.tier, s.name;`}]},{topic:`Deploys`,blurb:`Deploy cadence and the stragglers that haven't shipped in a while.`,queries:[{label:`Deploy-speed mix by team`,description:`How many services on each team fall into Fast / Medium / Slow buckets.`,sql:`SELECT
  team,
  deploymentSpeed,
  COUNT(*) AS services
FROM services
GROUP BY team, deploymentSpeed
ORDER BY team, deploymentSpeed;`},{label:`Slowest-deploying tier-1 services`,description:`Tier-1 services tagged Slow or Very Slow: release-velocity hotspots.`,sql:`SELECT
  name,
  team,
  deploymentSpeed,
  lastDeployedAt
FROM services
WHERE tier = 'tier1'
  AND deploymentSpeed IN ('Slow', 'Very Slow')
ORDER BY lastDeployedAt ASC;`},{label:`Stalest deploys in the catalog`,description:`Services ordered by oldest lastDeployedAt: likely abandoned or frozen.`,sql:`SELECT
  name,
  team,
  tier,
  deploymentSpeed,
  lastDeployedAt
FROM services
WHERE lastDeployedAt IS NOT NULL
ORDER BY lastDeployedAt ASC
LIMIT 20;`}]}],t=[{prompt:`Which services have eaten the most incident time?`,topic:`Reliability`,curatedLabel:`Top services by incident count`},{prompt:`What are the most expensive incidents on record?`,topic:`Cost`,curatedLabel:`Highest-cost incidents (top 20)`},{prompt:`Which tier-1 services aren't in SOC2 scope?`,topic:`Security`,curatedLabel:`Tier-1 services missing SOC2 scope`},{prompt:`Which services don't have an owner?`,topic:`Ownership`,curatedLabel:`Services without an owner email`},{prompt:`Where is the catalog drifting from reality?`,topic:`Drift`,curatedLabel:`Services with no monitors attached`},{prompt:`Where are the deploy-velocity hotspots?`,topic:`Deploys`,curatedLabel:`Slowest-deploying tier-1 services`}];function n(t){for(let n of e){let e=n.queries.find(e=>e.label===t);if(e)return e}return null}var r=[{name:`services`,description:`Catalogued services: the spine of every JOIN.`,columns:[{name:`id`,type:`string`,desc:`Stable service identifier.`},{name:`name`,type:`string`},{name:`team`,type:`string`},{name:`product`,type:`string`},{name:`environment`,type:`string`},{name:`score`,type:`number`,desc:`0 to 100 maturity score.`},{name:`status`,type:`string`},{name:`ownerEmail`,type:`string`},{name:`tier`,type:`string`,desc:`tier1 / tier2 / tier3`},{name:`deploymentSpeed`,type:`string`},{name:`lastDeployedAt`,type:`timestamp`},{name:`criticalPath`,type:`boolean`},{name:`complianceScope`,type:`array`,desc:`SOC2 / ISO27001 / PCI / HIPAA / GDPR tags.`},{name:`regions`,type:`array`}]},{name:`incidents`,description:`Recent incidents: join on serviceId.`,columns:[{name:`id`,type:`string`},{name:`title`,type:`string`},{name:`severity`,type:`string`,desc:`sev1 / sev2 / sev3`},{name:`status`,type:`string`},{name:`serviceId`,type:`string`,desc:`→ services.id`},{name:`serviceName`,type:`string`},{name:`startedAt`,type:`timestamp`},{name:`resolvedAt`,type:`timestamp`},{name:`durationMinutes`,type:`number`},{name:`responder`,type:`string`},{name:`cost`,type:`number`,desc:`Estimated USD impact.`},{name:`customerMinutesAffected`,type:`number`}]},{name:`monitors`,description:`Monitors with current state: join on serviceId.`,columns:[{name:`id`,type:`string`},{name:`name`,type:`string`},{name:`type`,type:`string`,desc:`metric / log / synthetic / anomaly`},{name:`serviceId`,type:`string`,desc:`→ services.id`},{name:`serviceName`,type:`string`},{name:`team`,type:`string`},{name:`status`,type:`string`,desc:`ok / alert / warn / no-data / muted`},{name:`priority`,type:`number`,desc:`1 (highest) to 5 (lowest)`},{name:`noisy`,type:`boolean`},{name:`mutedUntil`,type:`timestamp`}]},{name:`dependencies`,description:`Service dependency edges.`,columns:[{name:`sourceId`,type:`string`,desc:`→ services.id`},{name:`sourceName`,type:`string`},{name:`targetId`,type:`string`,desc:`→ services.id`},{name:`targetName`,type:`string`},{name:`kind`,type:`string`,desc:`sync / async / data`},{name:`critical`,type:`boolean`}]}];export{n as i,t as n,e as r,r as t};