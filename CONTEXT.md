# Tofan

Tofan is a fitness ecosystem: Soldiers train with the app, Trainers sell coaching to them, and admins run both.
This repository holds the admin panel, the coach panel and the public landing site.

## People

**Soldier**:
A person who uses the Tofan app to train.
_Avoid_: User (for the app's customer), athlete

**Trainer**:
A person who sells coaching to Soldiers through a Trainer subscription.
_Avoid_: Coach (as a domain term)

**Client**:
A Soldier as seen by the Trainer they hold a Trainer subscription with.
_Avoid_: Athlete, student

**Coach panel**:
The web panel a Trainer works in; "Coach" names the app, never the person.
_Avoid_: Trainer panel

## Selling

**Tariff**:
A plan of the Tofan app itself (Free, Standard or VIP) that a Soldier buys from Tofan.
_Avoid_: Plan, Tier

**Trainer subscription**:
A Soldier's paid access to one Trainer for a fixed period.
_Avoid_: Coach subscription

**Tier**:
The level of a Trainer subscription, Standard or VIP; only VIP opens chat with the Trainer.
_Avoid_: Tariff, plan

**VIP price**:
The optional monthly price a Trainer charges for the VIP Tier; without it the Trainer sells Standard only.
_Avoid_: Premium price

**Benefit**:
A plain-text line, written in three languages, that tells a Soldier what a Tariff or a Tier gives.
_Avoid_: Feature, perk

**Platform fee**:
The global commission, tax and payment provider fee Tofan adds on top of a Trainer's or a Tariff's price.
_Avoid_: Trainer commission
