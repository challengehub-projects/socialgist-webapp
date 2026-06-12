  return (
    <BrowserRouter>
      <div className="bg-purple-50 min-h-screen selection:bg-purple-600 selection:text-white antialiased">
        <Routes>
          {/* Landing welcome root router screen */}
          <Route
            path="/"
            element={<RouterViewWrapper Component={WelcomePage} />}
          />

          {/* Register system path configuration */}
          <Route
            path="/signup"
            element={<RouterViewWrapper Component={SignupPage} />}
          />

          {/* Account authorization path configuration */}
          <Route
            path="/login"
            element={<RouterViewWrapper Component={LoginPage} />}
          />

          <Route
            path="/messages"
            element={<RouterViewWrapper Component={MessagesPage} />}
          />

          <Route
            path="/terms"
            element={<RouterViewWrapper Component={TermsOfServicePage} />}
          />

          <Route
            path="/profile"
            element={
              <>
                <TopNavbar />
                <ProfilePage />
              </>
            }
          />

          <Route
            path="/post"
            element={
              <>
                <TopNavbar />
                <PostEditor />
              </>
            }
          />

          <Route
            path="/notifications"
            element={
              <>
                <TopNavbar />
                <NotificationsPage />
              </>
            }
          />

          {/* Main campus community dashboard stream dashboard view */}
          <Route
            path="/feed"
            element={
              <>
                <TopNavbar />
                <PostFeedStream />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );