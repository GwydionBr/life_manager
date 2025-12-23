import { useIntl } from "@/hooks/useIntl";

import { Accordion, Box } from "@mantine/core";
import { IconCalendar, IconClock, IconFolder } from "@tabler/icons-react";
import SessionRow from "@/components/Work/Session/SessionRow/SessionRow";

import type { Tables } from "@/types/db.types";
import type { Year } from "@/types/timerSession.types";
import CustomAccordionControl from "./CustomAccordionControl";

const Radius = 20;

interface SessionHierarchyProps {
  groupedSessions: { year: number; data: Year }[];
  selectedSessions: string[];
  onSessionToggle: (sessionId: string, index: number, range: boolean) => void;
  onGroupToggle: (sessionIds: string[]) => void;
  selectableIdSet: Set<string>;
  project?: Tables<"timer_project">;
  projects?: Tables<"timer_project">[];
  isOverview: boolean;
  selectedModeActive: boolean;
}

export default function SessionHierarchy({
  groupedSessions,
  selectedSessions,
  onSessionToggle,
  onGroupToggle,
  selectableIdSet,
  project,
  projects,
  isOverview,
  selectedModeActive,
}: SessionHierarchyProps) {
  const { getLocalizedText, formatDate, formatMonth } = useIntl();
  const getBorderColor = (sessionIds: string[]): string | undefined => {
    const groupIds = sessionIds.filter((id) => selectableIdSet.has(id));
    if (groupIds.length === 0) return undefined;
    const selectedCount = groupIds.filter((id) =>
      selectedSessions.includes(id)
    ).length;
    if (selectedCount === 0) return undefined;
    if (selectedCount === groupIds.length) return "var(--mantine-color-blue-6)";
    return "var(--mantine-color-teal-6)";
  };

  const getBackgroundColor = (sessionIds: string[]): string | undefined => {
    const groupIds = sessionIds.filter((id) => selectableIdSet.has(id));
    if (groupIds.length === 0) return undefined;
    const selectedCount = groupIds.filter((id) =>
      selectedSessions.includes(id)
    ).length;
    if (selectedCount === groupIds.length)
      return "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6))";
    if (selectedCount === 0) return undefined;
  };

  return (
    <Box>
      {groupedSessions.reverse().map(({ year, data: yearData }, index) => (
        // Year Section
        <Accordion
          key={year}
          variant="separated"
          pt={20}
          multiple
          defaultValue={index === 0 ? [String(yearData.totalEarnings)] : []}
          radius={Radius}
        >
          <Accordion.Item
            value={String(yearData.totalEarnings)}
            style={{
              borderColor:
                getBorderColor(yearData.sessionIds),
              backgroundColor: getBackgroundColor(yearData.sessionIds),
            }}
          >
            <CustomAccordionControl
              icon={<IconCalendar size={18} />}
              label={year.toString()}
              earnings={yearData.totalEarnings}
              time={yearData.totalTime}
              selectedSessionIds={selectedSessions}
              sessionIds={yearData.sessionIds}
              selectionModeActive={selectedModeActive}
              onGroupToggle={onGroupToggle}
              selectableIdSet={selectableIdSet}
            />
            <Accordion.Panel>
              {Object.entries(yearData.months)
                .reverse()
                .map(([month, monthData], index) => (
                  // Month Section
                  <Accordion
                    key={month}
                    p={10}
                    variant="separated"
                    multiple
                    radius={Radius}
                    defaultValue={
                      index === 0 ? [String(monthData.totalEarnings)] : []
                    }
                  >
                    <Accordion.Item
                      value={String(monthData.totalEarnings)}
                      style={{
                        borderColor: getBorderColor(monthData.sessionIds),
                        backgroundColor: getBackgroundColor(
                          monthData.sessionIds
                        ),
                      }}
                    >
                      <CustomAccordionControl
                        icon={<IconFolder size={18} color="blue" />}
                        label={formatMonth(Number(month))}
                        earnings={monthData.totalEarnings}
                        time={monthData.totalTime}
                        selectedSessionIds={selectedSessions}
                        sessionIds={monthData.sessionIds}
                        selectionModeActive={selectedModeActive}
                        onGroupToggle={onGroupToggle}
                        selectableIdSet={selectableIdSet}
                      />
                      <Accordion.Panel>
                        {Object.entries(monthData.weeks)
                          .reverse()
                          .map(([week, weekData], index) => (
                            // Week Section
                            <Accordion
                              key={week}
                              variant="separated"
                              multiple
                              radius={Radius}
                              p={5}
                              defaultValue={
                                index === 0
                                  ? [String(weekData.totalEarnings)]
                                  : []
                              }
                            >
                              <Accordion.Item
                                value={String(weekData.totalEarnings)}
                                style={{
                                  borderColor: getBorderColor(
                                    weekData.sessionIds
                                  ),
                                  backgroundColor: getBackgroundColor(
                                    weekData.sessionIds
                                  ),
                                }}
                              >
                                <CustomAccordionControl
                                  icon={
                                    <IconCalendar size={18} color="orange" />
                                  }
                                  label={getLocalizedText(
                                    `${week}. Woche`,
                                    `Week ${week}`
                                  )}
                                  earnings={weekData.totalEarnings}
                                  time={weekData.totalTime}
                                  selectedSessionIds={selectedSessions}
                                  sessionIds={weekData.sessionIds}
                                  selectionModeActive={selectedModeActive}
                                  onGroupToggle={onGroupToggle}
                                  selectableIdSet={selectableIdSet}
                                />
                                <Accordion.Panel>
                                  {Object.entries(weekData.days)
                                    .sort(([dayA], [dayB]) =>
                                      dayA.localeCompare(dayB)
                                    )
                                    .reverse()
                                    .map(([day, dayData], index) => (
                                      // Day Section
                                      <Accordion
                                        key={day}
                                        variant="separated"
                                        multiple
                                        radius={Radius}
                                        p={5}
                                        defaultValue={
                                          index === 0
                                            ? [String(dayData.totalEarnings)]
                                            : []
                                        }
                                      >
                                        <Accordion.Item
                                          value={day}
                                          style={{
                                            borderColor: getBorderColor(
                                              dayData.sessionIds
                                            ),
                                            backgroundColor: getBackgroundColor(
                                              dayData.sessionIds
                                            ),
                                          }}
                                        >
                                          <CustomAccordionControl
                                            icon={
                                              <IconClock
                                                size={18}
                                                color="green"
                                              />
                                            }
                                            label={formatDate(new Date(day))}
                                            earnings={dayData.totalEarnings}
                                            time={dayData.totalTime}
                                            selectedSessionIds={
                                              selectedSessions
                                            }
                                            sessionIds={dayData.sessionIds}
                                            selectionModeActive={
                                              selectedModeActive
                                            }
                                            onGroupToggle={onGroupToggle}
                                            selectableIdSet={selectableIdSet}
                                          />
                                          <Accordion.Panel>
                                            {dayData.sessions
                                              .sort(
                                                (a, b) =>
                                                  new Date(
                                                    a.start_time
                                                  ).getTime() -
                                                  new Date(
                                                    b.start_time
                                                  ).getTime()
                                              )
                                              .reverse()
                                              .map((session) => (
                                                <SessionRow
                                                  selectedModeActive={
                                                    selectedModeActive
                                                  }
                                                  key={session.id}
                                                  session={session}
                                                  project={
                                                    project ||
                                                    projects?.find(
                                                      (p) =>
                                                        p.id ===
                                                        session.project_id
                                                    )
                                                  }
                                                  isSelected={selectedSessions.includes(
                                                    session.id
                                                  )}
                                                  onToggleSelected={(e) =>
                                                    onSessionToggle(
                                                      session.id,
                                                      session.index,
                                                      e.shiftKey
                                                    )
                                                  }
                                                  isOverview={isOverview}
                                                />
                                              ))}
                                          </Accordion.Panel>
                                        </Accordion.Item>
                                      </Accordion>
                                    ))}
                                </Accordion.Panel>
                              </Accordion.Item>
                            </Accordion>
                          ))}
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                ))}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ))}
    </Box>
  );
}
