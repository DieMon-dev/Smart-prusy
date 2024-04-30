def getSSID(config_text):
    conNameVarIndex = config_text.find("Connection Name")+ 18
    fromText = config_text[conNameVarIndex:]
    conNameVarEndIndex = conNameVarIndex + fromText.find(";")
    print("Given SSID: ",config_text[conNameVarIndex:conNameVarEndIndex])
    return config_text[conNameVarIndex:conNameVarEndIndex]

def getWiFiPWD(config_text):
    conPwdVarIndex = config_text.find("Password")+ 11
    fromText = config_text[conPwdVarIndex:]
    conPwdVarEndIndex = conPwdVarIndex + fromText.find(";")
    print("Given password: ", config_text[conPwdVarIndex:conPwdVarEndIndex])
    return config_text[conPwdVarIndex:conPwdVarEndIndex]