package promptpal.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.result.view.RedirectView;

@RestController
public class HomeController {

	@GetMapping("/")
    public RedirectView redirectToFrontend() {
        return new RedirectView("http://localhost:3000");
}
}