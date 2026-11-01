package main

import (
	"changeme/backend/db"
	"changeme/backend/monitor"
	"changeme/backend/process"
	"changeme/backend/service"
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

type eventEmitter struct {
	emit func(name string, data ...any) bool
}

func (e *eventEmitter) Emit(name string, data ...any) {
	e.emit(name, data...)
}

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	application.RegisterEvent[string]("time")
}

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	database, err := db.Open("gopulse.db")
	if err != nil {
		logger.Error("failed to open database", "err", err)
		os.Exit(1)
	}
	defer database.Close()

	app := application.New(application.Options{
		Name:        "GoPulse",
		Description: "System monitor",
		Services: []application.Service{
			application.NewService(&service.ProcessService{}),
			application.NewService(&service.HistoryService{DB: database}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	mainWindow := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "GoPulse",
		Width:  1000,
		Height: 618,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(6, 7, 15),
		URL:              "/",
	})

	systray := app.SystemTray.New()

	systray.SetTooltip("GoPulse — System Monitor")

	menu := app.NewMenu()
	menu.Add("Открыть").OnClick(func(ctx *application.Context) {
		mainWindow.Show()
		mainWindow.Focus()
	})
	menu.AddSeparator()
	menu.Add("Выйти").OnClick(func(ctx *application.Context) {
		app.Quit()
	})
	systray.SetMenu(menu)

	mainWindow.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
		mainWindow.Hide()
		e.Cancel()
	})

	collector := monitor.New()
	manager := process.New(collector, database, &eventEmitter{emit: app.Event.Emit}, logger)

	go func() {
		if err := manager.Run(context.Background()); err != nil {
			logger.Error("manager stopped", "err", err)
		}
	}()

	if err := app.Run(); err != nil {
		logger.Error("app run failed", "err", err)
	}
}
