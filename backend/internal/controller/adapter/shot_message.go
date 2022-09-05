package adapter

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/HackYourCareer/SmartKickers/internal/config"
	"github.com/HackYourCareer/SmartKickers/internal/model"
)

type tableShotParams struct {
	TimeStart int     `json:"TimeStart"`
	TimeEnd   int     `json:"TimeEnd"`
	Speed     float64 `json:"Speed"`
	StartArea int     `json:"StartArea"`
	EndArea   int     `json:"EndArea"`
	GameID    string  `json:"GameID"`
	Sequence  int     `json:"Sequence"`
	ID        string  `json:"ID"`
}

type tableShotMsg struct {
	Mode        string            `json:"mode"`
	MessageType string            `json:"messageType"`
	Params      []json.RawMessage `json:"messages"`
}

func UnpackShotMsg(message io.Reader) (model.Shot, error) {
	var (
		shotMessage tableShotMsg
		params      tableShotParams
	)

	err := json.NewDecoder(message).Decode(&shotMessage)
	if err != nil {
		return model.Shot{}, err
	}

	if len(shotMessage.Params) == 0 {
		return model.Shot{}, fmt.Errorf("missing shot parameters")
	}

	err = json.Unmarshal(shotMessage.Params[0], &params)
	if err != nil {
		return model.Shot{}, err
	}

	teamID, err := decodeTeam(params.StartArea)
	if err != nil {
		return model.Shot{}, err
	}

	return model.Shot{
		Speed:      params.Speed,
		Team:       teamID,
		ShotAtGoal: checkIfShotAtGoal(params.EndArea, teamID),
	}, nil
}

func checkIfShotAtGoal(areaID int, teamID int) bool {
	return config.TeamBlue == teamID && areaID == config.WhiteTeamGoalArea ||
		config.TeamWhite == teamID && areaID == config.BlueTeamGoalArea
}

func decodeTeam(areaID int) (int, error) {
	for _, w := range config.WhiteTeamArea {
		if w == areaID {
			return config.TeamWhite, nil
		}
	}

	for _, b := range config.BlueTeamArea {
		if b == areaID {
			return config.TeamBlue, nil
		}
	}

	return 0, fmt.Errorf("couldn't decode teamID")
}
