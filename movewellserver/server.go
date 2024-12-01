package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"io"
	"io/ioutil"
	"log"
	"movewell/repo"
	"movewell/repo/dao/model"
	"net/http"
	"strconv"
)

func main() {

	repo.Init()

	r := mux.NewRouter()

	r.Path("/api/ping").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("ok"))
		if err != nil {
			return
		}

	}).Methods("GET")

	r.Path("/api/register").HandlerFunc(Register).Methods("POST")
	r.Path("/api/login").HandlerFunc(Login).Methods("POST")

	err := http.ListenAndServe(":8080", corsMiddleware(r))
	if err != nil {
		log.Fatal(err)
		return
	}
}

type RegisterInfo struct {
	Name                 string   `json:"name"`
	Pwd                  string   `json:"pwd"`
	RePwd                string   `json:"re_pwd"`
	TelValue             string   `json:"telValue"`
	Age                  string   `json:"age"`
	Bmi                  string   `json:"bmi"`
	MobilityValue        string   `json:"mobilityValue"`
	AvailableTimesValues []string `json:"availableTimesValues"`
	Latitude             float64  `json:"latitude"`
	Longitude            float64  `json:"longitude"`
}

func (r *RegisterInfo) String() string {
	bs, _ := json.Marshal(r)
	return string(bs)
}

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	ret := new(RegisterInfo)
	defer func() {
		_ = r.Body.Close()
	}()

	data, err := io.ReadAll(r.Body)
	err = json.Unmarshal(data, &ret)
	if err != nil {
		FailResponse(w, err.Error())
		return
	}
	ctx := r.Context()
	age, err := strconv.Atoi(ret.Age)
	if err != nil {
		FailResponse(w, err.Error())
		return
	}
	bmi, err := strconv.Atoi(ret.Bmi)
	if err != nil {
		FailResponse(w, err.Error())
		return
	}

	availableTimeValuesStr := func(r []string) string {
		bs, _ := json.Marshal(r)
		return string(bs)
	}

	err = repo.RegisterUser(ctx, &model.User{
		Username:            ret.Name,
		Password:            ret.Pwd,
		Phone:               ret.TelValue,
		Age:                 int32(age),
		Bmi:                 int32(bmi),
		MobilityValue:       ret.MobilityValue,
		AvailableTimeValues: availableTimeValuesStr(ret.AvailableTimesValues),
		Latitude:            ret.Latitude,
		Longitude:           ret.Longitude,
	})

	if err != nil {
		FailResponse(w, err.Error())
		return
	}

	response := &Response{
		Code: 0,
		Msg:  "ok",
	}

	OkResponse(w, response)

}

type loginInfo struct {
	UserName string `json:"username"`
	Password string `json:"password"`
}

type loginResponse struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
	BMI  int    `json:"bmi"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	ret := new(loginInfo)
	defer func() {
		_ = r.Body.Close()
	}()
	data, err := ioutil.ReadAll(r.Body)
	err = json.Unmarshal(data, &ret)
	if err != nil {
		FailResponse(w, err.Error())
		return
	}
	ctx := r.Context()
	user, err := repo.Login(ctx, ret.UserName, ret.Password)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			FailResponse(w, fmt.Sprintf("username %v not found,plz check", ret.UserName))
			return
		}
		FailResponse(w, err.Error())
	}

	OkResponse(w, &loginResponse{
		Name: user.Username,
		Age:  int(user.Age),
		BMI:  int(user.Bmi),
	})

	return

}

func OkResponse(w http.ResponseWriter, data interface{}) {
	response := &Response{
		Code: 0,
		Data: data,
	}
	bs, _ := json.Marshal(response)
	fmt.Println(string(bs))
	_, err := w.Write(bs)
	if err != nil {
		log.Println(fmt.Sprintf("OkResponse error %v ", err.Error()))
		return
	}

}

func FailResponse(w http.ResponseWriter, msg string) {
	response := &Response{
		Code: -1,
		Msg:  msg,
	}
	bs, _ := json.Marshal(response)
	_, err := w.Write(bs)
	if err != nil {
		log.Println(fmt.Sprintf("FailResponse error %v ", err.Error()))
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		method := r.Method
		fmt.Println("method", method)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS,DELETE,PUT")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type, New-Token, New-Expires-At")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// 放行所有OPTIONS方法
		if method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
