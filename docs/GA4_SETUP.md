# GA4 Setup for BrainRotChecker

This file maps the analytics events already implemented in the app to GA4 custom dimensions and custom metrics.

## 1) Verify Event Flow First

1. Open GA4 -> Reports -> Realtime.
2. Use the app and trigger these actions:
- Start diagnosis
- Complete quiz
- Complete reaction test
- Start a game
- Complete a game
- Reach final results
3. Confirm these event names appear:
- screen_view
- screen_navigate
- landing_cta_clicked
- quiz_started
- quiz_completed
- reaction_test_started
- reaction_test_completed
- diagnosis_generated
- game_start
- game_complete
- rehab_completed
- result_shared
- progress_reset_clicked
- pwa_install_prompt_ready
- pwa_install_clicked
- pwa_install_choice
- pwa_installed
- pwa_install_guide_selected
- app_session_started

## 2) Create Custom Dimensions (Event Scope)

GA4 -> Admin -> Custom definitions -> Create custom dimensions.

Create these Event-scoped dimensions:

- game_id
- game_name
- from_screen
- to_screen
- cta
- diagnosis_label
- diagnosis_tier
- final_tier
- tier_improvement
- method
- platform
- outcome
- user_type
- first_play
- is_new_best

Notes:
- Keep parameter names exactly the same as above.
- Some parameters are numeric; they can still be Event-scoped dimensions when you want grouping/filtering.

## 3) Create Custom Metrics

GA4 -> Admin -> Custom definitions -> Create custom metrics.

Create these metrics:

- score
- best_score
- quiz_score
- reaction_score
- total_score
- games_played
- question_count
- rounds
- avg_reaction_ms

## 4) Most-Played Games Report

Use Explore -> Free form:

- Rows: game_name
- Metrics: Event count
- Filter: eventName exactly matches game_start
- Sort: Event count descending

This shows which game users start most often.

## 5) Game Performance Report

Explore -> Free form:

- Rows: game_name
- Metrics: Average(score), Average(best_score), Event count
- Filter: eventName exactly matches game_complete

This shows difficulty/performance by game.

## 6) Retention Funnel Report

Explore -> Funnel exploration:

Suggested steps:
1. landing_cta_clicked
2. quiz_started
3. quiz_completed
4. reaction_test_completed
5. diagnosis_generated
6. game_start
7. rehab_completed

Use this to identify where users drop out.

## 7) Outcome Quality Report

Explore -> Free form:

- Rows: diagnosis_label, final_tier
- Metrics: Event count
- Filter: eventName exactly matches rehab_completed

This shows how often users improve and by how much.

## 8) PWA Install Conversion Report

Explore -> Funnel exploration:

1. pwa_install_prompt_ready
2. pwa_install_clicked
3. pwa_install_choice (outcome = accepted)
4. pwa_installed

This tells you prompt-to-install conversion quality.

## 9) Suggested Retention KPIs

Track weekly trends for:

- Game start rate: game_start users / diagnosis_generated users
- Completion rate: rehab_completed users / game_start users
- Return behavior proxy: ratio of game_complete where first_play = 0
- Share rate: result_shared users / rehab_completed users
- Install rate: pwa_installed users / pwa_install_prompt_ready users

## 10) Practical Notes

- Realtime updates immediately; standard reports can lag.
- Custom definitions are not retroactive.
- If a metric is missing in Explore, wait a few minutes after creating definitions.
- Keep event and parameter names stable to preserve historical trend continuity.
